"""
WebSocket connection management for real-time collaboration.
Handles JWT authentication, connection lifecycle, and message broadcasting.
"""

from fastapi import WebSocket, WebSocketDisconnect, Depends, Query
from typing import Dict, List, Set, Optional
from datetime import datetime, timezone
import json
import jwt
from src.utils.security import SECRET_KEY, ALGORITHM

class ConnectionManager:
    """
    Manages WebSocket connections for real-time communication.
    Supports room-based messaging for tickets and global broadcasts.
    """

    def __init__(self):
        # Active connections: user_id -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Room subscriptions: room_id -> set of user_ids
        self.rooms: Dict[str, Set[str]] = {}
        # User info cache: user_id -> user data
        self.user_info: Dict[str, dict] = {}
        # Typing indicators: room_id -> dict of user_id -> timestamp
        self.typing_users: Dict[str, Dict[str, datetime]] = {}
        # Presence status: user_id -> status
        self.presence: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str, user_data: dict):
        """Accept a new WebSocket connection and register the user."""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []

        self.active_connections[user_id].append(websocket)
        self.user_info[user_id] = user_data
        self.presence[user_id] = "online"

        # Broadcast presence update
        await self.broadcast_presence_update(user_id, "online")

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection and clean up user data if no connections remain."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)

            # If no more connections for this user, clean up
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

                # Remove from all rooms
                for room_id in list(self.rooms.keys()):
                    if user_id in self.rooms[room_id]:
                        self.rooms[room_id].discard(user_id)
                        if not self.rooms[room_id]:
                            del self.rooms[room_id]

                # Update presence
                if user_id in self.presence:
                    del self.presence[user_id]

                # Clean up typing indicators
                for room_id in self.typing_users:
                    if user_id in self.typing_users[room_id]:
                        del self.typing_users[room_id][user_id]

    async def join_room(self, user_id: str, room_id: str):
        """Add a user to a room for targeted messaging."""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()

        self.rooms[room_id].add(user_id)

        # Notify room members
        await self.broadcast_to_room(room_id, {
            "type": "user_joined",
            "room_id": room_id,
            "user_id": user_id,
            "user_info": self.user_info.get(user_id, {}),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }, exclude_user=user_id)

    async def leave_room(self, user_id: str, room_id: str):
        """Remove a user from a room."""
        if room_id in self.rooms:
            self.rooms[room_id].discard(user_id)

            if not self.rooms[room_id]:
                del self.rooms[room_id]
            else:
                # Notify remaining room members
                await self.broadcast_to_room(room_id, {
                    "type": "user_left",
                    "room_id": room_id,
                    "user_id": user_id,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })

        # Clear typing indicator for this user in this room
        if room_id in self.typing_users and user_id in self.typing_users[room_id]:
            del self.typing_users[room_id][user_id]

    async def send_personal_message(self, user_id: str, message: dict):
        """Send a message to a specific user (all their connections)."""
        if user_id in self.active_connections:
            message_json = json.dumps(message)
            disconnected = []

            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_json)
                except Exception:
                    disconnected.append(connection)

            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn, user_id)

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        """Broadcast a message to all users in a room."""
        if room_id not in self.rooms:
            return

        message_json = json.dumps(message)

        for user_id in self.rooms[room_id]:
            if exclude_user and user_id == exclude_user:
                continue

            if user_id in self.active_connections:
                disconnected = []

                for connection in self.active_connections[user_id]:
                    try:
                        await connection.send_text(message_json)
                    except Exception:
                        disconnected.append(connection)

                # Clean up disconnected connections
                for conn in disconnected:
                    self.disconnect(conn, user_id)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected users."""
        message_json = json.dumps(message)

        for user_id, connections in list(self.active_connections.items()):
            disconnected = []

            for connection in connections:
                try:
                    await connection.send_text(message_json)
                except Exception:
                    disconnected.append(connection)

            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn, user_id)

    async def broadcast_presence_update(self, user_id: str, status: str):
        """Broadcast a user's presence status to relevant users."""
        user_info = self.user_info.get(user_id, {})

        message = {
            "type": "presence_update",
            "user_id": user_id,
            "user_info": user_info,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Broadcast to all rooms the user is in
        for room_id, users in self.rooms.items():
            if user_id in users:
                await self.broadcast_to_room(room_id, message, exclude_user=user_id)

    async def set_typing(self, user_id: str, room_id: str, is_typing: bool):
        """Update typing indicator for a user in a room."""
        if room_id not in self.typing_users:
            self.typing_users[room_id] = {}

        if is_typing:
            self.typing_users[room_id][user_id] = datetime.now(timezone.utc)
        else:
            if user_id in self.typing_users[room_id]:
                del self.typing_users[room_id][user_id]

        # Broadcast typing status to room
        await self.broadcast_to_room(room_id, {
            "type": "typing_indicator",
            "room_id": room_id,
            "user_id": user_id,
            "user_info": self.user_info.get(user_id, {}),
            "is_typing": is_typing,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }, exclude_user=user_id)

    def get_room_users(self, room_id: str) -> List[dict]:
        """Get list of users currently in a room with their info."""
        if room_id not in self.rooms:
            return []

        users = []
        for user_id in self.rooms[room_id]:
            user_data = self.user_info.get(user_id, {})
            users.append({
                "user_id": user_id,
                "user_info": user_data,
                "status": self.presence.get(user_id, "offline")
            })

        return users

    def get_typing_users(self, room_id: str) -> List[dict]:
        """Get list of users currently typing in a room."""
        if room_id not in self.typing_users:
            return []

        typing = []
        now = datetime.now(timezone.utc)

        for user_id, timestamp in list(self.typing_users[room_id].items()):
            # Clear typing indicators older than 5 seconds
            if (now - timestamp).total_seconds() > 5:
                del self.typing_users[room_id][user_id]
            else:
                typing.append({
                    "user_id": user_id,
                    "user_info": self.user_info.get(user_id, {})
                })

        return typing


# Global connection manager instance
manager = ConnectionManager()


def verify_websocket_token(token: str) -> Optional[dict]:
    """Verify JWT token and return user data."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            return None

        return {
            "user_id": user_id,
            "email": payload.get("email", ""),
            "name": payload.get("name", ""),
            "role": payload.get("role", "user")
        }
    except jwt.ExpiredSignatureError:
        return None
    except jwt.PyJWTError:
        return None


async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """
    Main WebSocket endpoint for real-time communication.
    Requires JWT token for authentication.
    """
    # Verify token
    user_data = verify_websocket_token(token)

    if not user_data:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    user_id = user_data["user_id"]

    # Connect user
    await manager.connect(websocket, user_id, user_data)

    try:
        # Send connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connected",
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }))

        # Handle incoming messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            await handle_websocket_message(user_id, message)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        await manager.broadcast_presence_update(user_id, "offline")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)


async def handle_websocket_message(user_id: str, message: dict):
    """Process incoming WebSocket messages based on type."""
    msg_type = message.get("type")

    if msg_type == "join_room":
        room_id = message.get("room_id")
        if room_id:
            await manager.join_room(user_id, room_id)

            # Send current room state
            await manager.send_personal_message(user_id, {
                "type": "room_state",
                "room_id": room_id,
                "users": manager.get_room_users(room_id),
                "typing_users": manager.get_typing_users(room_id),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

    elif msg_type == "leave_room":
        room_id = message.get("room_id")
        if room_id:
            await manager.leave_room(user_id, room_id)

    elif msg_type == "typing":
        room_id = message.get("room_id")
        is_typing = message.get("is_typing", False)
        if room_id:
            await manager.set_typing(user_id, room_id, is_typing)

    elif msg_type == "message":
        room_id = message.get("room_id")
        content = message.get("content")
        if room_id and content:
            # Broadcast message to room
            await manager.broadcast_to_room(room_id, {
                "type": "new_message",
                "room_id": room_id,
                "user_id": user_id,
                "user_info": manager.user_info.get(user_id, {}),
                "content": content,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

    elif msg_type == "ping":
        await manager.send_personal_message(user_id, {
            "type": "pong",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
