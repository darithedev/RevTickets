"""
WebSocket connection management with proper cleanup to prevent memory leaks.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Optional
import asyncio
import logging
import weakref

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections with proper cleanup to prevent memory leaks.
    Uses weak references where appropriate and ensures all resources are released.
    """

    def __init__(self):
        # Active connections mapped by user_id
        self._connections: Dict[str, Set[WebSocket]] = {}
        # Track connection metadata for cleanup
        self._connection_metadata: Dict[int, dict] = {}
        # Event listeners that need cleanup
        self._event_listeners: Dict[int, list] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
        # Heartbeat tasks for connection health monitoring
        self._heartbeat_tasks: Dict[int, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        """
        Accept a WebSocket connection and register it for the user.

        Args:
            websocket: The WebSocket connection to accept
            user_id: The ID of the user connecting
        """
        await websocket.accept()

        async with self._lock:
            if user_id not in self._connections:
                self._connections[user_id] = set()

            self._connections[user_id].add(websocket)

            # Store connection metadata
            ws_id = id(websocket)
            self._connection_metadata[ws_id] = {
                'user_id': user_id,
                'connected_at': asyncio.get_event_loop().time(),
                'message_count': 0
            }

            # Initialize event listeners list for this connection
            self._event_listeners[ws_id] = []

            # Start heartbeat for connection health monitoring
            self._heartbeat_tasks[ws_id] = asyncio.create_task(
                self._heartbeat(websocket, ws_id)
            )

        logger.info(f"WebSocket connected for user {user_id}. Total connections: {len(self._connections[user_id])}")

    async def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        """
        Properly disconnect and cleanup a WebSocket connection.
        Ensures all resources are released to prevent memory leaks.

        Args:
            websocket: The WebSocket connection to disconnect
            user_id: The ID of the user disconnecting
        """
        ws_id = id(websocket)

        async with self._lock:
            # Cancel heartbeat task
            if ws_id in self._heartbeat_tasks:
                self._heartbeat_tasks[ws_id].cancel()
                try:
                    await self._heartbeat_tasks[ws_id]
                except asyncio.CancelledError:
                    pass
                del self._heartbeat_tasks[ws_id]

            # Clean up event listeners
            if ws_id in self._event_listeners:
                for cleanup_callback in self._event_listeners[ws_id]:
                    try:
                        if asyncio.iscoroutinefunction(cleanup_callback):
                            await cleanup_callback()
                        else:
                            cleanup_callback()
                    except Exception as e:
                        logger.error(f"Error during event listener cleanup: {e}")
                del self._event_listeners[ws_id]

            # Remove connection metadata
            if ws_id in self._connection_metadata:
                del self._connection_metadata[ws_id]

            # Remove from active connections
            if user_id in self._connections:
                self._connections[user_id].discard(websocket)
                if not self._connections[user_id]:
                    del self._connections[user_id]

        # Close the WebSocket connection
        try:
            await websocket.close()
        except Exception as e:
            logger.debug(f"WebSocket already closed: {e}")

        logger.info(f"WebSocket disconnected for user {user_id}")

    def add_event_listener(self, websocket: WebSocket, cleanup_callback) -> None:
        """
        Register an event listener cleanup callback for a connection.

        Args:
            websocket: The WebSocket connection
            cleanup_callback: Function to call during cleanup
        """
        ws_id = id(websocket)
        if ws_id in self._event_listeners:
            self._event_listeners[ws_id].append(cleanup_callback)

    async def send_personal_message(self, message: dict, user_id: str) -> None:
        """
        Send a message to all connections for a specific user.

        Args:
            message: The message to send
            user_id: The user to send the message to
        """
        if user_id not in self._connections:
            return

        disconnected = []
        for websocket in self._connections[user_id].copy():
            try:
                await websocket.send_json(message)
                ws_id = id(websocket)
                if ws_id in self._connection_metadata:
                    self._connection_metadata[ws_id]['message_count'] += 1
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                disconnected.append(websocket)

        # Clean up failed connections
        for websocket in disconnected:
            await self.disconnect(websocket, user_id)

    async def broadcast(self, message: dict, exclude_user: Optional[str] = None) -> None:
        """
        Broadcast a message to all connected users.

        Args:
            message: The message to broadcast
            exclude_user: Optional user ID to exclude from broadcast
        """
        for user_id in list(self._connections.keys()):
            if user_id != exclude_user:
                await self.send_personal_message(message, user_id)

    async def _heartbeat(self, websocket: WebSocket, ws_id: int) -> None:
        """
        Send periodic heartbeat pings to check connection health.

        Args:
            websocket: The WebSocket connection
            ws_id: The connection ID
        """
        try:
            while True:
                await asyncio.sleep(30)  # Ping every 30 seconds
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    # Connection is dead, will be cleaned up
                    break
        except asyncio.CancelledError:
            pass

    async def cleanup_stale_connections(self) -> None:
        """
        Clean up any stale or dead connections.
        Should be called periodically to prevent resource accumulation.
        """
        async with self._lock:
            for user_id in list(self._connections.keys()):
                stale = []
                for websocket in self._connections[user_id]:
                    try:
                        # Try to send a ping to check if connection is alive
                        await asyncio.wait_for(
                            websocket.send_json({"type": "ping"}),
                            timeout=5.0
                        )
                    except Exception:
                        stale.append(websocket)

                for websocket in stale:
                    await self.disconnect(websocket, user_id)

    def get_connection_count(self, user_id: Optional[str] = None) -> int:
        """
        Get the number of active connections.

        Args:
            user_id: Optional user ID to get connections for

        Returns:
            Number of active connections
        """
        if user_id:
            return len(self._connections.get(user_id, set()))
        return sum(len(conns) for conns in self._connections.values())


# Global connection manager instance
manager = ConnectionManager()
