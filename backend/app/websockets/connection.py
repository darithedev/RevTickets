"""
WebSocket connection management with proper JWT authentication.
Prevents unauthorized access by validating tokens on connection.
"""

from fastapi import WebSocket, WebSocketDisconnect, Query, HTTPException, status
from typing import Dict, Set, Optional
import asyncio
import logging
from datetime import datetime, timezone

from src.utils.security import decode_token, SECRET_KEY, ALGORITHM
from src.models.user import User
import jwt
from jose import JWTError

logger = logging.getLogger(__name__)


class WebSocketAuthError(Exception):
    """Custom exception for WebSocket authentication errors."""
    pass


async def validate_websocket_token(token: str) -> User:
    """
    Validate JWT token for WebSocket connections.

    Args:
        token: The JWT token to validate

    Returns:
        The authenticated User object

    Raises:
        WebSocketAuthError: If token is invalid or user not found
    """
    if not token:
        raise WebSocketAuthError("No authentication token provided")

    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise WebSocketAuthError("Token has expired")

        # Get user email from token
        email: str = payload.get("sub")
        if not email:
            raise WebSocketAuthError("Invalid token: missing subject")

        # Fetch user from database
        user = await User.find_one(User.email == email)
        if not user:
            raise WebSocketAuthError("User not found")

        return user

    except jwt.ExpiredSignatureError:
        raise WebSocketAuthError("Token has expired")
    except jwt.InvalidTokenError as e:
        raise WebSocketAuthError(f"Invalid token: {str(e)}")
    except JWTError as e:
        raise WebSocketAuthError(f"JWT validation failed: {str(e)}")


class SecureConnectionManager:
    """
    Manages WebSocket connections with JWT authentication.
    All connections must be authenticated before being accepted.
    """

    def __init__(self):
        # Active connections mapped by user_id
        self._connections: Dict[str, Set[WebSocket]] = {}
        # User info for each connection
        self._connection_users: Dict[int, User] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
        # Connection timestamps
        self._connection_times: Dict[int, datetime] = {}

    async def connect(self, websocket: WebSocket, token: str) -> User:
        """
        Authenticate and accept a WebSocket connection.

        Args:
            websocket: The WebSocket connection
            token: JWT token for authentication

        Returns:
            The authenticated User object

        Raises:
            WebSocketAuthError: If authentication fails
        """
        # Validate token BEFORE accepting connection
        try:
            user = await validate_websocket_token(token)
        except WebSocketAuthError as e:
            # Close connection with authentication error
            await websocket.close(code=4001, reason=str(e))
            raise

        # Accept connection only after successful authentication
        await websocket.accept()

        user_id = str(user.id)
        ws_id = id(websocket)

        async with self._lock:
            # Add to connections
            if user_id not in self._connections:
                self._connections[user_id] = set()
            self._connections[user_id].add(websocket)

            # Store user info
            self._connection_users[ws_id] = user
            self._connection_times[ws_id] = datetime.now(timezone.utc)

        logger.info(f"WebSocket authenticated and connected for user {user.email}")
        return user

    async def disconnect(self, websocket: WebSocket) -> None:
        """
        Disconnect a WebSocket connection and cleanup resources.

        Args:
            websocket: The WebSocket connection to disconnect
        """
        ws_id = id(websocket)

        async with self._lock:
            # Get user info
            user = self._connection_users.get(ws_id)
            if user:
                user_id = str(user.id)

                # Remove from connections
                if user_id in self._connections:
                    self._connections[user_id].discard(websocket)
                    if not self._connections[user_id]:
                        del self._connections[user_id]

                # Cleanup user info
                del self._connection_users[ws_id]
                logger.info(f"WebSocket disconnected for user {user.email}")

            # Cleanup timestamps
            if ws_id in self._connection_times:
                del self._connection_times[ws_id]

        # Close the connection
        try:
            await websocket.close()
        except Exception:
            pass

    def get_user(self, websocket: WebSocket) -> Optional[User]:
        """
        Get the authenticated user for a WebSocket connection.

        Args:
            websocket: The WebSocket connection

        Returns:
            The User object or None if not found
        """
        return self._connection_users.get(id(websocket))

    async def send_to_user(self, user_id: str, message: dict) -> int:
        """
        Send a message to all connections for a specific user.

        Args:
            user_id: The user ID to send to
            message: The message to send

        Returns:
            Number of connections message was sent to
        """
        if user_id not in self._connections:
            return 0

        sent = 0
        failed = []

        for websocket in self._connections[user_id].copy():
            try:
                await websocket.send_json(message)
                sent += 1
            except Exception as e:
                logger.error(f"Failed to send message to user {user_id}: {e}")
                failed.append(websocket)

        # Clean up failed connections
        for websocket in failed:
            await self.disconnect(websocket)

        return sent

    async def broadcast(self, message: dict, exclude_user: Optional[str] = None) -> int:
        """
        Broadcast a message to all connected users.

        Args:
            message: The message to broadcast
            exclude_user: Optional user ID to exclude

        Returns:
            Number of users message was sent to
        """
        sent = 0
        for user_id in list(self._connections.keys()):
            if user_id != exclude_user:
                count = await self.send_to_user(user_id, message)
                if count > 0:
                    sent += 1
        return sent

    async def require_role(self, websocket: WebSocket, required_role: str) -> bool:
        """
        Check if the connected user has the required role.

        Args:
            websocket: The WebSocket connection
            required_role: The role required (e.g., 'agent')

        Returns:
            True if user has the role, False otherwise
        """
        user = self.get_user(websocket)
        if not user:
            return False
        return user.role.value == required_role

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

    def get_connected_users(self) -> list:
        """
        Get list of connected user IDs.

        Returns:
            List of user IDs with active connections
        """
        return list(self._connections.keys())


# Global secure connection manager instance
secure_manager = SecureConnectionManager()


# WebSocket endpoint handler example
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token")
):
    """
    Example WebSocket endpoint with JWT authentication.

    Usage:
        ws://localhost:8000/ws?token=<jwt_token>
    """
    try:
        # Authenticate and connect
        user = await secure_manager.connect(websocket, token)

        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "user_id": str(user.id),
            "email": user.email
        })

        # Handle messages
        try:
            while True:
                data = await websocket.receive_json()

                # Echo back for now
                await websocket.send_json({
                    "type": "message",
                    "data": data
                })

        except WebSocketDisconnect:
            pass
        finally:
            await secure_manager.disconnect(websocket)

    except WebSocketAuthError as e:
        logger.warning(f"WebSocket authentication failed: {e}")
        # Connection already closed in connect method
