"""
Real-time messaging service for WebSocket communication.
Provides high-level interface for real-time features.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from app.websockets.connection import manager
from app.websockets.ticket_events import ticket_events, TicketEventHandler


class RealtimeService:
    """
    High-level service for managing real-time communication.
    Provides unified interface for all real-time features.
    """

    def __init__(self):
        self.manager = manager
        self.ticket_events = ticket_events

    # Connection Management

    def get_online_users(self) -> List[str]:
        """Get list of all currently online user IDs."""
        return list(self.manager.active_connections.keys())

    def get_user_status(self, user_id: str) -> str:
        """Get the presence status of a user."""
        return self.manager.presence.get(user_id, "offline")

    def is_user_online(self, user_id: str) -> bool:
        """Check if a user is currently online."""
        return user_id in self.manager.active_connections

    # Room Management

    def get_room_users(self, room_id: str) -> List[dict]:
        """Get all users in a specific room."""
        return self.manager.get_room_users(room_id)

    def get_ticket_viewers(self, ticket_id: str) -> List[dict]:
        """Get all users currently viewing a ticket."""
        return TicketEventHandler.get_ticket_viewers(ticket_id)

    # Message Broadcasting

    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected users."""
        await self.manager.broadcast(message)

    async def send_to_user(self, user_id: str, message: dict):
        """Send a message to a specific user."""
        await self.manager.send_personal_message(user_id, message)

    async def broadcast_to_ticket(self, ticket_id: str, message: dict):
        """Broadcast a message to all users viewing a ticket."""
        room_id = f"ticket:{ticket_id}"
        await self.manager.broadcast_to_room(room_id, message)

    # Ticket Events

    async def notify_comment_created(
        self,
        ticket_id: str,
        comment: dict,
        user_info: dict
    ):
        """Notify users about a new comment on a ticket."""
        await self.ticket_events.on_comment_created(ticket_id, comment, user_info)

    async def notify_comment_updated(
        self,
        ticket_id: str,
        comment: dict,
        user_info: dict
    ):
        """Notify users about an updated comment."""
        await self.ticket_events.on_comment_updated(ticket_id, comment, user_info)

    async def notify_comment_deleted(
        self,
        ticket_id: str,
        comment_id: str,
        user_info: dict
    ):
        """Notify users about a deleted comment."""
        await self.ticket_events.on_comment_deleted(ticket_id, comment_id, user_info)

    async def notify_status_changed(
        self,
        ticket_id: str,
        old_status: str,
        new_status: str,
        user_info: dict
    ):
        """Notify users about a ticket status change."""
        await self.ticket_events.on_status_changed(ticket_id, old_status, new_status, user_info)

    async def notify_assignment_changed(
        self,
        ticket_id: str,
        old_agent: Optional[dict],
        new_agent: Optional[dict],
        user_info: dict
    ):
        """Notify users about a ticket assignment change."""
        await self.ticket_events.on_assignment_changed(ticket_id, old_agent, new_agent, user_info)

    async def notify_priority_changed(
        self,
        ticket_id: str,
        old_priority: str,
        new_priority: str,
        user_info: dict
    ):
        """Notify users about a ticket priority change."""
        await self.ticket_events.on_priority_changed(ticket_id, old_priority, new_priority, user_info)

    async def notify_ticket_created(self, ticket: dict, user_info: dict):
        """Notify users about a new ticket creation."""
        await self.ticket_events.on_ticket_created(ticket, user_info)

    async def notify_ticket_closed(
        self,
        ticket_id: str,
        resolution: str,
        user_info: dict
    ):
        """Notify users about a ticket closure."""
        await self.ticket_events.on_ticket_closed(ticket_id, resolution, user_info)

    async def notify_ticket_reopened(
        self,
        ticket_id: str,
        reason: str,
        user_info: dict
    ):
        """Notify users about a ticket being reopened."""
        await self.ticket_events.on_ticket_reopened(ticket_id, reason, user_info)

    # User Notifications

    async def notify_user(
        self,
        user_id: str,
        notification_type: str,
        data: dict
    ):
        """Send a notification to a specific user."""
        await self.ticket_events.notify_user(user_id, notification_type, data)

    async def notify_agent_assignment(
        self,
        agent_id: str,
        ticket_id: str,
        ticket_title: str
    ):
        """Notify an agent about a new ticket assignment."""
        await self.notify_user(agent_id, "ticket_assigned", {
            "ticket_id": ticket_id,
            "ticket_title": ticket_title,
            "message": f"You have been assigned to ticket: {ticket_title}"
        })

    async def notify_customer_response(
        self,
        customer_id: str,
        ticket_id: str,
        ticket_title: str
    ):
        """Notify a customer about a response to their ticket."""
        await self.notify_user(customer_id, "ticket_response", {
            "ticket_id": ticket_id,
            "ticket_title": ticket_title,
            "message": f"New response on your ticket: {ticket_title}"
        })

    # Typing Indicators

    def get_typing_users(self, ticket_id: str) -> List[dict]:
        """Get users currently typing in a ticket."""
        return TicketEventHandler.get_typing_users_for_ticket(ticket_id)

    # System Events

    async def broadcast_system_message(self, message: str, severity: str = "info"):
        """Broadcast a system message to all users."""
        await self.manager.broadcast({
            "type": "system_message",
            "message": message,
            "severity": severity,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    async def broadcast_maintenance_notice(self, message: str, scheduled_time: datetime):
        """Broadcast a maintenance notice to all users."""
        await self.manager.broadcast({
            "type": "maintenance_notice",
            "message": message,
            "scheduled_time": scheduled_time.isoformat(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })


# Export singleton instance
realtime_service = RealtimeService()
