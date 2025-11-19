"""
Ticket-specific WebSocket event handlers.
Handles real-time ticket updates, comments, and status changes.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .connection import manager


class TicketEventHandler:
    """
    Handles ticket-related real-time events.
    Broadcasts updates to relevant users when ticket data changes.
    """

    @staticmethod
    def get_ticket_room(ticket_id: str) -> str:
        """Get the room ID for a specific ticket."""
        return f"ticket:{ticket_id}"

    @staticmethod
    async def broadcast_ticket_update(ticket_id: str, update_type: str, data: dict):
        """Broadcast a ticket update to all users viewing the ticket."""
        room_id = TicketEventHandler.get_ticket_room(ticket_id)

        await manager.broadcast_to_room(room_id, {
            "type": "ticket_update",
            "update_type": update_type,
            "ticket_id": ticket_id,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    @staticmethod
    async def on_comment_created(ticket_id: str, comment: dict, user_info: dict):
        """
        Handle new comment creation event.
        Broadcasts to all users viewing the ticket.
        """
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "comment_created",
            {
                "comment": comment,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_comment_updated(ticket_id: str, comment: dict, user_info: dict):
        """Handle comment update event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "comment_updated",
            {
                "comment": comment,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_comment_deleted(ticket_id: str, comment_id: str, user_info: dict):
        """Handle comment deletion event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "comment_deleted",
            {
                "comment_id": comment_id,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_status_changed(ticket_id: str, old_status: str, new_status: str, user_info: dict):
        """Handle ticket status change event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "status_changed",
            {
                "old_status": old_status,
                "new_status": new_status,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_assignment_changed(ticket_id: str, old_agent: Optional[dict], new_agent: Optional[dict], user_info: dict):
        """Handle ticket assignment change event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "assignment_changed",
            {
                "old_agent": old_agent,
                "new_agent": new_agent,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_priority_changed(ticket_id: str, old_priority: str, new_priority: str, user_info: dict):
        """Handle ticket priority change event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "priority_changed",
            {
                "old_priority": old_priority,
                "new_priority": new_priority,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_ticket_updated(ticket_id: str, changes: dict, user_info: dict):
        """Handle generic ticket update event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "ticket_updated",
            {
                "changes": changes,
                "user_info": user_info
            }
        )

    @staticmethod
    async def notify_user(user_id: str, notification_type: str, data: dict):
        """Send a notification to a specific user."""
        await manager.send_personal_message(user_id, {
            "type": "notification",
            "notification_type": notification_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    @staticmethod
    async def on_ticket_created(ticket: dict, user_info: dict):
        """
        Handle new ticket creation event.
        Notifies relevant agents about new tickets.
        """
        # Broadcast to all connected users (agents will filter relevant ones)
        await manager.broadcast({
            "type": "ticket_created",
            "ticket": ticket,
            "user_info": user_info,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    @staticmethod
    async def on_ticket_closed(ticket_id: str, resolution: str, user_info: dict):
        """Handle ticket closure event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "ticket_closed",
            {
                "resolution": resolution,
                "user_info": user_info
            }
        )

    @staticmethod
    async def on_ticket_reopened(ticket_id: str, reason: str, user_info: dict):
        """Handle ticket reopen event."""
        await TicketEventHandler.broadcast_ticket_update(
            ticket_id,
            "ticket_reopened",
            {
                "reason": reason,
                "user_info": user_info
            }
        )

    @staticmethod
    def get_ticket_viewers(ticket_id: str) -> list:
        """Get list of users currently viewing a ticket."""
        room_id = TicketEventHandler.get_ticket_room(ticket_id)
        return manager.get_room_users(room_id)

    @staticmethod
    def get_typing_users_for_ticket(ticket_id: str) -> list:
        """Get list of users currently typing in a ticket."""
        room_id = TicketEventHandler.get_ticket_room(ticket_id)
        return manager.get_typing_users(room_id)


# Export handler instance for convenience
ticket_events = TicketEventHandler()
