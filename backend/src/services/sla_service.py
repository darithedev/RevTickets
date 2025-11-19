from datetime import datetime, timezone, timedelta
from typing import Optional
from src.models.ticket import Ticket
from src.models.enums import TicketPriority, TicketStatus


class SLAService:
    # SLA times in hours by priority
    SLA_TIMES = {
        TicketPriority.critical: 2,
        TicketPriority.high: 4,
        TicketPriority.medium: 24,
        TicketPriority.low: 48
    }

    @staticmethod
    def calculate_sla_due_date(priority: TicketPriority, created_at: datetime) -> datetime:
        """Calculate SLA due date based on ticket priority"""
        hours = SLAService.SLA_TIMES.get(priority, 24)  # Default to 24 hours
        return created_at + timedelta(hours=hours)

    @staticmethod
    def get_sla_hours(priority: TicketPriority) -> int:
        """Get SLA hours for a given priority"""
        return SLAService.SLA_TIMES.get(priority, 24)

    @staticmethod
    async def setup_sla(ticket: Ticket) -> Ticket:
        """Setup SLA for a new ticket"""
        ticket.sla_due_date = SLAService.calculate_sla_due_date(
            ticket.priority,
            ticket.created_at
        )
        ticket.sla_breached = False
        ticket.sla_paused_at = None
        ticket.sla_pause_duration = 0
        return ticket

    @staticmethod
    async def pause_sla(ticket: Ticket) -> Ticket:
        """Pause SLA timer when waiting for customer"""
        if not ticket.sla_paused_at:
            ticket.sla_paused_at = datetime.now(timezone.utc)
        return ticket

    @staticmethod
    async def resume_sla(ticket: Ticket) -> Ticket:
        """Resume SLA timer when no longer waiting for customer"""
        if ticket.sla_paused_at:
            # Calculate pause duration
            now = datetime.now(timezone.utc)
            pause_duration = (now - ticket.sla_paused_at).total_seconds()
            ticket.sla_pause_duration += int(pause_duration)

            # Adjust SLA due date by the pause duration
            if ticket.sla_due_date:
                ticket.sla_due_date = ticket.sla_due_date + timedelta(seconds=pause_duration)

            ticket.sla_paused_at = None
        return ticket

    @staticmethod
    async def check_sla_breach(ticket: Ticket) -> bool:
        """Check if ticket has breached SLA"""
        if not ticket.sla_due_date:
            return False

        # Don't check if ticket is closed or resolved
        if ticket.status in [TicketStatus.closed, TicketStatus.resolved]:
            return ticket.sla_breached

        # If paused, calculate effective time
        now = datetime.now(timezone.utc)

        if ticket.sla_paused_at:
            # SLA is paused, check based on when it was paused
            effective_now = ticket.sla_paused_at
        else:
            effective_now = now

        return effective_now > ticket.sla_due_date

    @staticmethod
    async def update_sla_breach_status(ticket: Ticket) -> Ticket:
        """Update the SLA breach status of a ticket"""
        is_breached = await SLAService.check_sla_breach(ticket)
        if is_breached and not ticket.sla_breached:
            ticket.sla_breached = True
        return ticket

    @staticmethod
    async def handle_status_change(ticket: Ticket, old_status: TicketStatus, new_status: TicketStatus) -> Ticket:
        """Handle SLA timer pause/resume based on status changes"""
        # Pause SLA when waiting for customer
        if new_status == TicketStatus.waiting_for_customer:
            ticket = await SLAService.pause_sla(ticket)
        # Resume SLA when no longer waiting for customer
        elif old_status == TicketStatus.waiting_for_customer and new_status != TicketStatus.waiting_for_customer:
            ticket = await SLAService.resume_sla(ticket)

        # Always check for breach
        ticket = await SLAService.update_sla_breach_status(ticket)

        return ticket

    @staticmethod
    async def get_all_active_tickets() -> list:
        """Get all tickets that need SLA monitoring"""
        active_statuses = [
            TicketStatus.new,
            TicketStatus.in_progress,
            TicketStatus.waiting_for_customer,
            TicketStatus.waiting_for_agent
        ]

        all_tickets = await Ticket.find_all().to_list()
        return [t for t in all_tickets if t.status in active_statuses]

    @staticmethod
    async def monitor_and_update_breaches() -> dict:
        """Monitor all active tickets and update breach status"""
        active_tickets = await SLAService.get_all_active_tickets()

        breached_count = 0
        updated_count = 0

        for ticket in active_tickets:
            was_breached = ticket.sla_breached
            ticket = await SLAService.update_sla_breach_status(ticket)

            if ticket.sla_breached:
                breached_count += 1
                if not was_breached:
                    await ticket.save()
                    updated_count += 1

        return {
            "total_active": len(active_tickets),
            "breached": breached_count,
            "newly_breached": updated_count
        }

    @staticmethod
    def get_time_remaining(ticket: Ticket) -> Optional[timedelta]:
        """Get time remaining until SLA breach"""
        if not ticket.sla_due_date:
            return None

        if ticket.status in [TicketStatus.closed, TicketStatus.resolved]:
            return None

        now = datetime.now(timezone.utc)

        if ticket.sla_paused_at:
            # If paused, calculate from pause time
            return ticket.sla_due_date - ticket.sla_paused_at

        remaining = ticket.sla_due_date - now
        return remaining if remaining.total_seconds() > 0 else timedelta(0)
