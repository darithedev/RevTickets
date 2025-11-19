from celery import Celery
from datetime import datetime, timezone
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from src.core.config import settings
from src.models.ticket import Ticket
from src.models.category import Category
from src.models.subcategory import SubCategory
from src.models.tag import Tag
from src.models.comment import Comment
from src.models.user import User
from src.models.article import Article
from src.models.agent_info import AgentInfo
from src.services.sla_service import SLAService

# Configure Celery
celery_app = Celery(
    'sla_monitor',
    broker=settings.redis_url if hasattr(settings, 'redis_url') else 'redis://localhost:6379/0',
    backend=settings.redis_url if hasattr(settings, 'redis_url') else 'redis://localhost:6379/0'
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    beat_schedule={
        'check-sla-breaches-every-minute': {
            'task': 'src.tasks.sla_monitor.check_sla_breaches',
            'schedule': 60.0,  # Run every 60 seconds
        },
    }
)


async def init_db_for_task():
    """Initialize database connection for Celery task"""
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.get_default_database()

    await init_beanie(
        database=db,
        document_models=[
            Ticket,
            Category,
            SubCategory,
            Tag,
            Comment,
            User,
            Article,
            AgentInfo
        ]
    )


@celery_app.task(name='src.tasks.sla_monitor.check_sla_breaches')
def check_sla_breaches():
    """Celery task to check and update SLA breach status for all active tickets"""
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    result = loop.run_until_complete(_check_sla_breaches_async())
    return result


async def _check_sla_breaches_async():
    """Async function to check SLA breaches"""
    await init_db_for_task()

    print(f"[{datetime.now(timezone.utc)}] Running SLA breach check...")

    result = await SLAService.monitor_and_update_breaches()

    print(f"[{datetime.now(timezone.utc)}] SLA breach check complete:")
    print(f"  - Total active tickets: {result['total_active']}")
    print(f"  - Currently breached: {result['breached']}")
    print(f"  - Newly breached: {result['newly_breached']}")

    return result


@celery_app.task(name='src.tasks.sla_monitor.update_single_ticket_sla')
def update_single_ticket_sla(ticket_id: str):
    """Celery task to update SLA status for a single ticket"""
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    result = loop.run_until_complete(_update_single_ticket_sla_async(ticket_id))
    return result


async def _update_single_ticket_sla_async(ticket_id: str):
    """Async function to update SLA for a single ticket"""
    from beanie import PydanticObjectId

    await init_db_for_task()

    ticket = await Ticket.get(PydanticObjectId(ticket_id))
    if not ticket:
        return {"success": False, "error": "Ticket not found"}

    ticket = await SLAService.update_sla_breach_status(ticket)
    await ticket.save()

    return {
        "success": True,
        "ticket_id": ticket_id,
        "sla_breached": ticket.sla_breached,
        "sla_due_date": ticket.sla_due_date.isoformat() if ticket.sla_due_date else None
    }
