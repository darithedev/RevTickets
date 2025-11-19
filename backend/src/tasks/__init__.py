# src/tasks/__init__.py
"""
Task package for background job processing.
Contains Celery tasks for escalation monitoring and other background jobs.
"""

from .escalation_monitor import (
    check_escalations,
    process_single_ticket_escalation,
    cleanup_old_escalation_history
)

__all__ = [
    'check_escalations',
    'process_single_ticket_escalation',
    'cleanup_old_escalation_history'
]
