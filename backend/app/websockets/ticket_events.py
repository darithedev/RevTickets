"""
Ticket event handling for WebSocket notifications with proper cleanup.
"""

from typing import Dict, Callable, List, Optional
from fastapi import WebSocket
import asyncio
import logging
import weakref

from .connection import manager

logger = logging.getLogger(__name__)


class TicketEventManager:
    """
    Manages ticket-related events and notifications with proper listener cleanup.
    """

    def __init__(self):
        # Event listeners by event type
        self._listeners: Dict[str, List[tuple]] = {}
        # Ticket subscriptions by ticket_id -> set of user_ids
        self._ticket_subscriptions: Dict[str, set] = {}
        # User subscriptions by user_id -> set of ticket_ids
        self._user_subscriptions: Dict[str, set] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()

    async def subscribe_to_ticket(self, ticket_id: str, user_id: str, websocket: WebSocket) -> None:
        """
        Subscribe a user to ticket updates.

        Args:
            ticket_id: The ticket to subscribe to
            user_id: The user subscribing
            websocket: The user's WebSocket connection
        """
        async with self._lock:
            # Add to ticket subscriptions
            if ticket_id not in self._ticket_subscriptions:
                self._ticket_subscriptions[ticket_id] = set()
            self._ticket_subscriptions[ticket_id].add(user_id)

            # Add to user subscriptions
            if user_id not in self._user_subscriptions:
                self._user_subscriptions[user_id] = set()
            self._user_subscriptions[user_id].add(ticket_id)

        # Register cleanup callback with connection manager
        async def cleanup():
            await self.unsubscribe_from_ticket(ticket_id, user_id)

        manager.add_event_listener(websocket, cleanup)

        logger.info(f"User {user_id} subscribed to ticket {ticket_id}")

    async def unsubscribe_from_ticket(self, ticket_id: str, user_id: str) -> None:
        """
        Unsubscribe a user from ticket updates.

        Args:
            ticket_id: The ticket to unsubscribe from
            user_id: The user unsubscribing
        """
        async with self._lock:
            # Remove from ticket subscriptions
            if ticket_id in self._ticket_subscriptions:
                self._ticket_subscriptions[ticket_id].discard(user_id)
                if not self._ticket_subscriptions[ticket_id]:
                    del self._ticket_subscriptions[ticket_id]

            # Remove from user subscriptions
            if user_id in self._user_subscriptions:
                self._user_subscriptions[user_id].discard(ticket_id)
                if not self._user_subscriptions[user_id]:
                    del self._user_subscriptions[user_id]

        logger.info(f"User {user_id} unsubscribed from ticket {ticket_id}")

    async def unsubscribe_user(self, user_id: str) -> None:
        """
        Unsubscribe a user from all tickets. Called during disconnect.

        Args:
            user_id: The user to unsubscribe
        """
        async with self._lock:
            if user_id in self._user_subscriptions:
                # Get all ticket subscriptions for this user
                ticket_ids = list(self._user_subscriptions[user_id])

                # Remove user from all ticket subscriptions
                for ticket_id in ticket_ids:
                    if ticket_id in self._ticket_subscriptions:
                        self._ticket_subscriptions[ticket_id].discard(user_id)
                        if not self._ticket_subscriptions[ticket_id]:
                            del self._ticket_subscriptions[ticket_id]

                # Clear user subscriptions
                del self._user_subscriptions[user_id]

        logger.info(f"User {user_id} unsubscribed from all tickets")

    def add_listener(self, event_type: str, callback: Callable, websocket: Optional[WebSocket] = None) -> Callable:
        """
        Add an event listener with automatic cleanup registration.

        Args:
            event_type: The type of event to listen for
            callback: The callback function to invoke
            websocket: Optional WebSocket to register cleanup with

        Returns:
            A function to remove the listener
        """
        if event_type not in self._listeners:
            self._listeners[event_type] = []

        listener_entry = (callback, id(callback))
        self._listeners[event_type].append(listener_entry)

        # Create removal function
        def remove_listener():
            if event_type in self._listeners:
                self._listeners[event_type] = [
                    l for l in self._listeners[event_type]
                    if l[1] != id(callback)
                ]
                if not self._listeners[event_type]:
                    del self._listeners[event_type]

        # Register cleanup with connection manager if websocket provided
        if websocket:
            manager.add_event_listener(websocket, remove_listener)

        return remove_listener

    def remove_listener(self, event_type: str, callback: Callable) -> None:
        """
        Remove a specific event listener.

        Args:
            event_type: The type of event
            callback: The callback to remove
        """
        if event_type in self._listeners:
            self._listeners[event_type] = [
                l for l in self._listeners[event_type]
                if l[1] != id(callback)
            ]
            if not self._listeners[event_type]:
                del self._listeners[event_type]

    async def emit(self, event_type: str, data: dict) -> None:
        """
        Emit an event to all registered listeners.

        Args:
            event_type: The type of event
            data: The event data
        """
        if event_type not in self._listeners:
            return

        # Create a copy to avoid modification during iteration
        listeners = self._listeners[event_type].copy()

        for callback, _ in listeners:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(data)
                else:
                    callback(data)
            except Exception as e:
                logger.error(f"Error in event listener for {event_type}: {e}")

    async def notify_ticket_update(self, ticket_id: str, event_type: str, data: dict) -> None:
        """
        Notify all subscribers of a ticket update.

        Args:
            ticket_id: The ticket that was updated
            event_type: The type of update (created, updated, commented, etc.)
            data: The update data
        """
        message = {
            "type": f"ticket_{event_type}",
            "ticket_id": ticket_id,
            "data": data
        }

        # Notify subscribed users
        if ticket_id in self._ticket_subscriptions:
            for user_id in self._ticket_subscriptions[ticket_id].copy():
                await manager.send_personal_message(message, user_id)

        # Emit event to listeners
        await self.emit(f"ticket_{event_type}", {
            "ticket_id": ticket_id,
            **data
        })

        logger.info(f"Notified ticket update: {event_type} for ticket {ticket_id}")

    async def notify_ticket_created(self, ticket_id: str, ticket_data: dict) -> None:
        """Notify about a new ticket creation."""
        await self.notify_ticket_update(ticket_id, "created", ticket_data)

    async def notify_ticket_updated(self, ticket_id: str, changes: dict) -> None:
        """Notify about ticket field updates."""
        await self.notify_ticket_update(ticket_id, "updated", changes)

    async def notify_ticket_commented(self, ticket_id: str, comment_data: dict) -> None:
        """Notify about a new comment on a ticket."""
        await self.notify_ticket_update(ticket_id, "commented", comment_data)

    async def notify_ticket_assigned(self, ticket_id: str, agent_data: dict) -> None:
        """Notify about ticket assignment."""
        await self.notify_ticket_update(ticket_id, "assigned", agent_data)

    async def notify_ticket_status_changed(self, ticket_id: str, status_data: dict) -> None:
        """Notify about ticket status change."""
        await self.notify_ticket_update(ticket_id, "status_changed", status_data)

    def get_subscription_count(self, ticket_id: Optional[str] = None) -> int:
        """
        Get the number of subscriptions.

        Args:
            ticket_id: Optional ticket ID to get subscriptions for

        Returns:
            Number of subscriptions
        """
        if ticket_id:
            return len(self._ticket_subscriptions.get(ticket_id, set()))
        return sum(len(subs) for subs in self._ticket_subscriptions.values())


# Global ticket event manager instance
ticket_events = TicketEventManager()
