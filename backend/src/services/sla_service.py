from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from src.models.ticket import Ticket
from src.models.enums import TicketPriority
from src.utils.business_date import (
    add_business_days,
    count_business_days,
    get_business_hours_remaining,
    is_business_day,
    next_business_day
)


# SLA response time targets in business hours by priority
SLA_RESPONSE_HOURS = {
    TicketPriority.critical: 1,    # 1 business hour
    TicketPriority.high: 4,        # 4 business hours
    TicketPriority.medium: 8,      # 8 business hours (1 business day)
    TicketPriority.low: 24,        # 24 business hours (3 business days)
}

# SLA resolution time targets in business days by priority
SLA_RESOLUTION_DAYS = {
    TicketPriority.critical: 1,    # 1 business day
    TicketPriority.high: 2,        # 2 business days
    TicketPriority.medium: 5,      # 5 business days
    TicketPriority.low: 10,        # 10 business days
}


class SLAService:
    """Service for SLA (Service Level Agreement) calculations with proper business day handling"""

    @staticmethod
    def get_sla_targets(priority: TicketPriority) -> Dict[str, Any]:
        """
        Get SLA targets for a given priority level.
        
        Args:
            priority: The ticket priority level
            
        Returns:
            Dictionary with response_hours and resolution_days targets
        """
        return {
            "response_hours": SLA_RESPONSE_HOURS.get(priority, 8),
            "resolution_days": SLA_RESOLUTION_DAYS.get(priority, 5),
        }

    @staticmethod
    def calculate_due_date(
        created_at: datetime,
        priority: TicketPriority,
        is_response: bool = False
    ) -> datetime:
        """
        Calculate the SLA due date based on priority and type.
        
        This method properly excludes weekends and holidays from the calculation.
        
        Args:
            created_at: The ticket creation timestamp
            priority: The ticket priority level
            is_response: If True, calculate response due date; otherwise resolution due date
            
        Returns:
            The calculated due date
        """
        if is_response:
            # For response SLA, add business hours
            target_hours = SLA_RESPONSE_HOURS.get(priority, 8)
            
            # Convert hours to business days (8 hours per business day)
            business_days = target_hours // 8
            remaining_hours = target_hours % 8
            
            # Add business days
            if business_days > 0:
                due_date = add_business_days(created_at, business_days)
            else:
                due_date = created_at
            
            # Add remaining hours
            due_date = due_date + timedelta(hours=remaining_hours)
            
            # If we end up on a non-business day, move to next business day
            if not is_business_day(due_date.date()):
                due_date = next_business_day(due_date)
                due_date = due_date.replace(hour=9, minute=0, second=0, microsecond=0)
            
        else:
            # For resolution SLA, add business days
            target_days = SLA_RESOLUTION_DAYS.get(priority, 5)
            due_date = add_business_days(created_at, target_days)
        
        return due_date

    @staticmethod
    def calculate_sla_status(ticket: Ticket) -> Dict[str, Any]:
        """
        Calculate the current SLA status for a ticket.
        
        Args:
            ticket: The ticket to check SLA status for
            
        Returns:
            Dictionary with SLA status information including:
            - response_due: Response due datetime
            - resolution_due: Resolution due datetime
            - response_breached: Whether response SLA is breached
            - resolution_breached: Whether resolution SLA is breached
            - response_remaining_hours: Hours remaining for response
            - resolution_remaining_hours: Hours remaining for resolution
        """
        now = datetime.now(timezone.utc)
        created_at = ticket.created_at
        
        # Ensure created_at is timezone-aware
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        priority = ticket.priority
        
        # Calculate due dates
        response_due = SLAService.calculate_due_date(created_at, priority, is_response=True)
        resolution_due = SLAService.calculate_due_date(created_at, priority, is_response=False)
        
        # Ensure due dates are timezone-aware
        if response_due.tzinfo is None:
            response_due = response_due.replace(tzinfo=timezone.utc)
        if resolution_due.tzinfo is None:
            resolution_due = resolution_due.replace(tzinfo=timezone.utc)
        
        # Calculate remaining business hours
        response_remaining = get_business_hours_remaining(now, response_due)
        resolution_remaining = get_business_hours_remaining(now, resolution_due)
        
        # Check if breached
        response_breached = now > response_due
        resolution_breached = now > resolution_due
        
        return {
            "response_due": response_due,
            "resolution_due": resolution_due,
            "response_breached": response_breached,
            "resolution_breached": resolution_breached,
            "response_remaining_hours": max(0, response_remaining),
            "resolution_remaining_hours": max(0, resolution_remaining),
            "priority": priority.value if hasattr(priority, 'value') else str(priority),
        }

    @staticmethod
    def get_sla_summary(tickets: list) -> Dict[str, Any]:
        """
        Get an SLA summary for a list of tickets.
        
        Args:
            tickets: List of tickets to analyze
            
        Returns:
            Summary dictionary with breach counts and percentages
        """
        total = len(tickets)
        if total == 0:
            return {
                "total": 0,
                "response_breached": 0,
                "resolution_breached": 0,
                "on_track": 0,
                "breach_percentage": 0,
            }
        
        response_breached = 0
        resolution_breached = 0
        
        for ticket in tickets:
            status = SLAService.calculate_sla_status(ticket)
            if status["response_breached"]:
                response_breached += 1
            if status["resolution_breached"]:
                resolution_breached += 1
        
        on_track = total - max(response_breached, resolution_breached)
        
        return {
            "total": total,
            "response_breached": response_breached,
            "resolution_breached": resolution_breached,
            "on_track": on_track,
            "breach_percentage": round((max(response_breached, resolution_breached) / total) * 100, 2),
        }

    @staticmethod
    def calculate_business_time_elapsed(start: datetime, end: datetime) -> Dict[str, float]:
        """
        Calculate elapsed business time between two datetimes.
        
        Args:
            start: Start datetime
            end: End datetime
            
        Returns:
            Dictionary with business_hours and business_days elapsed
        """
        business_hours = get_business_hours_remaining(start, end)
        business_days = count_business_days(start, end)
        
        return {
            "business_hours": business_hours,
            "business_days": business_days,
        }
