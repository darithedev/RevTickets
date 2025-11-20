# src/tasks/escalation_monitor.py
"""
Celery tasks for monitoring and processing ticket escalations.
These tasks run periodically to check for tickets that need to be escalated.
"""

from celery import Celery
from celery.schedules import crontab
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
import os

# Initialize Celery app
celery_app = Celery(
    'escalation_tasks',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per task
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    'check-escalations-every-5-minutes': {
        'task': 'src.tasks.escalation_monitor.check_escalations',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'cleanup-old-history-daily': {
        'task': 'src.tasks.escalation_monitor.cleanup_old_escalation_history',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}


def run_async(coro):
    """Helper to run async functions in sync context"""
    loop = asyncio.get_event_loop()
    if loop.is_running():
        # Create new loop for thread
        new_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(new_loop)
        try:
            return new_loop.run_until_complete(coro)
        finally:
            new_loop.close()
    else:
        return loop.run_until_complete(coro)


async def _init_db_connection():
    """Initialize database connection for task"""
    from src.db.init_db import init_db
    await init_db()


async def _check_escalations_async() -> Dict[str, Any]:
    """
    Async implementation of escalation check.
    Checks all active tickets and escalates as needed.
    """
    from src.services.escalation_service import EscalationService

    await _init_db_connection()

    results = await EscalationService.check_all_tickets_for_escalation()

    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "escalations_triggered": len(results),
        "details": results
    }


async def _process_single_ticket_async(ticket_id: str) -> Dict[str, Any]:
    """
    Async implementation of single ticket escalation check.
    """
    from src.services.escalation_service import EscalationService
    from src.models.ticket import Ticket
    from beanie import PydanticObjectId

    await _init_db_connection()

    ticket = await Ticket.get(PydanticObjectId(ticket_id))
    if not ticket:
        return {
            "success": False,
            "error": "Ticket not found",
            "ticket_id": ticket_id
        }

    rule = await EscalationService.check_ticket_for_escalation(ticket)
    if rule:
        result = await EscalationService.execute_escalation(ticket, rule)
        return {
            "success": True,
            "escalated": True,
            "ticket_id": ticket_id,
            "result": result
        }

    return {
        "success": True,
        "escalated": False,
        "ticket_id": ticket_id,
        "message": "No escalation rules matched"
    }


async def _cleanup_old_history_async(days: int = 90) -> Dict[str, Any]:
    """
    Async implementation of history cleanup.
    Removes escalation history older than specified days.
    """
    from src.models.escalation import EscalationHistory

    await _init_db_connection()

    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)

    # Find and count old records
    old_records = await EscalationHistory.find(
        {"escalatedAt": {"$lt": cutoff_date}}
    ).to_list()

    count = len(old_records)

    # Delete old records
    for record in old_records:
        await record.delete()

    return {
        "cleaned_at": datetime.now(timezone.utc).isoformat(),
        "records_deleted": count,
        "cutoff_days": days
    }


@celery_app.task(
    name='src.tasks.escalation_monitor.check_escalations',
    bind=True,
    max_retries=3,
    default_retry_delay=60
)
def check_escalations(self) -> Dict[str, Any]:
    """
    Celery task to check all tickets for escalation.
    Runs every 5 minutes via beat schedule.

    Returns:
        Dict with escalation results
    """
    try:
        result = run_async(_check_escalations_async())
        print(f"Escalation check completed: {result['escalations_triggered']} escalations triggered")
        return result
    except Exception as exc:
        print(f"Escalation check failed: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(
    name='src.tasks.escalation_monitor.process_single_ticket_escalation',
    bind=True,
    max_retries=3,
    default_retry_delay=30
)
def process_single_ticket_escalation(self, ticket_id: str) -> Dict[str, Any]:
    """
    Celery task to check a single ticket for escalation.
    Can be triggered on-demand (e.g., after status change).

    Args:
        ticket_id: The ID of the ticket to check

    Returns:
        Dict with escalation result
    """
    try:
        result = run_async(_process_single_ticket_async(ticket_id))
        if result.get('escalated'):
            print(f"Ticket {ticket_id} was escalated")
        return result
    except Exception as exc:
        print(f"Single ticket escalation check failed for {ticket_id}: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(
    name='src.tasks.escalation_monitor.cleanup_old_escalation_history',
    bind=True,
    max_retries=1
)
def cleanup_old_escalation_history(self, days: int = 90) -> Dict[str, Any]:
    """
    Celery task to clean up old escalation history records.
    Runs daily at 2 AM via beat schedule.

    Args:
        days: Number of days to keep history (default 90)

    Returns:
        Dict with cleanup results
    """
    try:
        result = run_async(_cleanup_old_history_async(days))
        print(f"History cleanup completed: {result['records_deleted']} records deleted")
        return result
    except Exception as exc:
        print(f"History cleanup failed: {exc}")
        raise self.retry(exc=exc)


# Additional utility tasks

@celery_app.task(name='src.tasks.escalation_monitor.send_escalation_notification')
def send_escalation_notification(
    ticket_id: str,
    agent_ids: List[str],
    message: str
) -> Dict[str, Any]:
    """
    Task to send notifications when an escalation occurs.

    Args:
        ticket_id: The escalated ticket ID
        agent_ids: List of agent IDs to notify
        message: Notification message

    Returns:
        Dict with notification status
    """
    # TODO: Implement actual notification logic (email, Slack, etc.)
    print(f"Sending escalation notification for ticket {ticket_id} to {len(agent_ids)} agents")

    return {
        "ticket_id": ticket_id,
        "notified_agents": agent_ids,
        "message": message,
        "sent_at": datetime.now(timezone.utc).isoformat()
    }


@celery_app.task(name='src.tasks.escalation_monitor.generate_escalation_report')
def generate_escalation_report(
    start_date: str = None,
    end_date: str = None
) -> Dict[str, Any]:
    """
    Task to generate an escalation report for a date range.

    Args:
        start_date: ISO format start date (default: 7 days ago)
        end_date: ISO format end date (default: now)

    Returns:
        Dict with report data
    """
    async def _generate_report():
        from src.services.escalation_service import EscalationService
        from src.models.escalation import EscalationHistory

        await _init_db_connection()

        # Parse dates
        if end_date:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end = datetime.now(timezone.utc)

        if start_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start = end - timedelta(days=7)

        # Get escalations in range
        histories = await EscalationHistory.find({
            "escalatedAt": {
                "$gte": start,
                "$lte": end
            }
        }).to_list()

        # Generate stats
        stats = await EscalationService.get_escalation_stats()

        return {
            "period": {
                "start": start.isoformat(),
                "end": end.isoformat()
            },
            "total_escalations": len(histories),
            "stats": stats,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    return run_async(_generate_report())


# Manual trigger functions (for use in API endpoints)

def trigger_escalation_check():
    """Trigger an immediate escalation check"""
    return check_escalations.delay()


def trigger_ticket_escalation_check(ticket_id: str):
    """Trigger escalation check for a specific ticket"""
    return process_single_ticket_escalation.delay(ticket_id)


def trigger_history_cleanup(days: int = 90):
    """Trigger history cleanup"""
    return cleanup_old_escalation_history.delay(days)
