# src/api/v1/routes/escalation.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from datetime import datetime

from src.models.user import User
from src.models.escalation import (
    EscalationRule,
    EscalationTriggerType,
    EscalationActionType,
    EscalationLevel
)
from src.services.escalation_service import EscalationService
from src.utils.security import get_current_user, get_current_agent_user
from src.tasks.escalation_monitor import (
    trigger_escalation_check,
    trigger_ticket_escalation_check
)

router = APIRouter(prefix="/escalations", tags=["Escalations"])


# === Request/Response Models ===

class EscalationRuleCreate(BaseModel):
    name: str = Field(..., description="Name of the escalation rule")
    description: Optional[str] = Field(None, description="Description of the rule")
    is_active: bool = Field(default=True)
    priority_order: int = Field(default=0)

    trigger_type: EscalationTriggerType
    trigger_minutes: Optional[int] = None
    trigger_priority: Optional[str] = None

    conditions: Optional[List[dict]] = []

    action_type: EscalationActionType
    target_agent_id: Optional[str] = None
    target_tier: Optional[EscalationLevel] = None
    increase_priority_to: Optional[str] = None

    category_id: Optional[str] = None
    applies_to_priorities: Optional[List[str]] = []

    notify_agents: Optional[List[str]] = []
    notification_message: Optional[str] = None


class EscalationRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    priority_order: Optional[int] = None

    trigger_type: Optional[EscalationTriggerType] = None
    trigger_minutes: Optional[int] = None
    trigger_priority: Optional[str] = None

    conditions: Optional[List[dict]] = None

    action_type: Optional[EscalationActionType] = None
    target_agent_id: Optional[str] = None
    target_tier: Optional[EscalationLevel] = None
    increase_priority_to: Optional[str] = None

    category_id: Optional[str] = None
    applies_to_priorities: Optional[List[str]] = None

    notify_agents: Optional[List[str]] = None
    notification_message: Optional[str] = None


class EscalationRuleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    is_active: bool
    priority_order: int

    trigger_type: str
    trigger_minutes: Optional[int]
    trigger_priority: Optional[str]

    conditions: List[dict]

    action_type: str
    target_agent_id: Optional[str]
    target_tier: Optional[str]
    increase_priority_to: Optional[str]

    category_id: Optional[str]
    applies_to_priorities: List[str]

    notification_message: Optional[str]

    created_at: datetime
    updated_at: datetime


class ManualEscalationRequest(BaseModel):
    target_tier: EscalationLevel
    reason: str = Field(..., min_length=1)
    target_agent_id: Optional[str] = None
    increase_priority: bool = False


class AgentTierRequest(BaseModel):
    tier: EscalationLevel
    category_ids: Optional[List[str]] = []
    max_tickets: int = 10


# === Helper Functions ===

async def _build_rule_response(rule: EscalationRule) -> EscalationRuleResponse:
    """Build response object from rule"""
    # Get category ID if linked
    category_id = None
    if rule.category_id:
        try:
            if hasattr(rule.category_id, 'ref') and rule.category_id.ref:
                category_id = str(rule.category_id.ref.id)
            elif hasattr(rule.category_id, 'id'):
                category_id = str(rule.category_id.id)
        except:
            pass

    # Get target agent ID
    target_agent_id = None
    if rule.target_agent_id:
        try:
            if hasattr(rule.target_agent_id, 'ref') and rule.target_agent_id.ref:
                target_agent_id = str(rule.target_agent_id.ref.id)
            elif hasattr(rule.target_agent_id, 'id'):
                target_agent_id = str(rule.target_agent_id.id)
        except:
            pass

    return EscalationRuleResponse(
        id=str(rule.id),
        name=rule.name,
        description=rule.description,
        is_active=rule.is_active,
        priority_order=rule.priority_order,
        trigger_type=rule.trigger_type.value,
        trigger_minutes=rule.trigger_minutes,
        trigger_priority=rule.trigger_priority,
        conditions=rule.conditions or [],
        action_type=rule.action_type.value,
        target_agent_id=target_agent_id,
        target_tier=rule.target_tier.value if rule.target_tier else None,
        increase_priority_to=rule.increase_priority_to,
        category_id=category_id,
        applies_to_priorities=rule.applies_to_priorities or [],
        notification_message=rule.notification_message,
        created_at=rule.created_at,
        updated_at=rule.updated_at
    )


# === Escalation Rules Endpoints ===

@router.get("/rules", response_model=List[EscalationRuleResponse])
async def get_escalation_rules(
    active_only: bool = False,
    current_user: User = Depends(get_current_agent_user)
):
    """Get all escalation rules"""
    rules = await EscalationService.get_all_rules(active_only=active_only)
    return [await _build_rule_response(rule) for rule in rules]


@router.post("/rules", response_model=EscalationRuleResponse)
async def create_escalation_rule(
    rule_data: EscalationRuleCreate,
    current_user: User = Depends(get_current_agent_user)
):
    """Create a new escalation rule"""
    # Convert to dict and handle references
    data = rule_data.model_dump(exclude_unset=True)

    # Handle category_id
    if data.get('category_id'):
        from src.models.category import Category
        category = await Category.get(data['category_id'])
        if category:
            data['category_id'] = category

    # Handle target_agent_id
    if data.get('target_agent_id'):
        agent = await User.get(data['target_agent_id'])
        if agent:
            data['target_agent_id'] = agent

    rule = await EscalationService.create_rule(data, current_user)
    return await _build_rule_response(rule)


@router.get("/rules/{rule_id}", response_model=EscalationRuleResponse)
async def get_escalation_rule(
    rule_id: PydanticObjectId,
    current_user: User = Depends(get_current_agent_user)
):
    """Get a specific escalation rule"""
    rule = await EscalationService.get_rule(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return await _build_rule_response(rule)


@router.put("/rules/{rule_id}", response_model=EscalationRuleResponse)
async def update_escalation_rule(
    rule_id: PydanticObjectId,
    rule_data: EscalationRuleUpdate,
    current_user: User = Depends(get_current_agent_user)
):
    """Update an escalation rule"""
    data = rule_data.model_dump(exclude_unset=True)

    # Handle category_id
    if 'category_id' in data and data['category_id']:
        from src.models.category import Category
        category = await Category.get(data['category_id'])
        if category:
            data['category_id'] = category

    # Handle target_agent_id
    if 'target_agent_id' in data and data['target_agent_id']:
        agent = await User.get(data['target_agent_id'])
        if agent:
            data['target_agent_id'] = agent

    rule = await EscalationService.update_rule(rule_id, data)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return await _build_rule_response(rule)


@router.delete("/rules/{rule_id}")
async def delete_escalation_rule(
    rule_id: PydanticObjectId,
    current_user: User = Depends(get_current_agent_user)
):
    """Delete an escalation rule"""
    if not await EscalationService.delete_rule(rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted successfully"}


@router.post("/rules/{rule_id}/toggle", response_model=EscalationRuleResponse)
async def toggle_escalation_rule(
    rule_id: PydanticObjectId,
    current_user: User = Depends(get_current_agent_user)
):
    """Toggle an escalation rule's active status"""
    rule = await EscalationService.toggle_rule(rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return await _build_rule_response(rule)


# === Escalation History Endpoints ===

@router.get("/history/ticket/{ticket_id}")
async def get_ticket_escalation_history(
    ticket_id: PydanticObjectId,
    current_user: User = Depends(get_current_user)
):
    """Get escalation history for a specific ticket"""
    history = await EscalationService.get_ticket_escalation_history(ticket_id)
    return history


@router.get("/stats")
async def get_escalation_stats(
    current_user: User = Depends(get_current_agent_user)
):
    """Get escalation statistics"""
    return await EscalationService.get_escalation_stats()


# === Manual Escalation Endpoints ===

@router.post("/ticket/{ticket_id}/escalate")
async def manually_escalate_ticket(
    ticket_id: PydanticObjectId,
    request: ManualEscalationRequest,
    current_user: User = Depends(get_current_agent_user)
):
    """Manually escalate a ticket"""
    target_agent_id = None
    if request.target_agent_id:
        target_agent_id = PydanticObjectId(request.target_agent_id)

    result = await EscalationService.manual_escalate(
        ticket_id=ticket_id,
        target_tier=request.target_tier,
        reason=request.reason,
        escalated_by=current_user,
        target_agent_id=target_agent_id,
        increase_priority=request.increase_priority
    )
    return result


# === Agent Tier Endpoints ===

@router.get("/tiers/agent/{user_id}")
async def get_agent_tier(
    user_id: PydanticObjectId,
    current_user: User = Depends(get_current_agent_user)
):
    """Get an agent's tier information"""
    tier = await EscalationService.get_agent_tier(user_id)
    if not tier:
        return {"user_id": str(user_id), "tier": None, "message": "Agent tier not set"}

    user = await tier.user_id.fetch()
    return {
        "user_id": str(user_id),
        "tier": tier.tier.value,
        "max_tickets": tier.max_tickets,
        "is_available": tier.is_available,
        "agent_name": f"{user.first_name} {user.last_name}" if user else None
    }


@router.post("/tiers/agent/{user_id}")
async def set_agent_tier(
    user_id: PydanticObjectId,
    request: AgentTierRequest,
    current_user: User = Depends(get_current_agent_user)
):
    """Set or update an agent's tier"""
    tier = await EscalationService.set_agent_tier(
        user_id=user_id,
        tier=request.tier,
        category_ids=request.category_ids,
        max_tickets=request.max_tickets
    )

    user = await tier.user_id.fetch()
    return {
        "user_id": str(user_id),
        "tier": tier.tier.value,
        "max_tickets": tier.max_tickets,
        "is_available": tier.is_available,
        "agent_name": f"{user.first_name} {user.last_name}" if user else None
    }


@router.get("/tiers/{tier}")
async def get_agents_by_tier(
    tier: EscalationLevel,
    current_user: User = Depends(get_current_agent_user)
):
    """Get all agents in a specific tier"""
    agent_tiers = await EscalationService.get_agents_by_tier(tier)

    result = []
    for at in agent_tiers:
        try:
            user = await at.user_id.fetch()
            result.append({
                "user_id": str(user.id),
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "tier": at.tier.value,
                "max_tickets": at.max_tickets,
                "is_available": at.is_available
            })
        except:
            continue

    return result


# === Task Trigger Endpoints ===

@router.post("/check-all")
async def trigger_escalation_check_endpoint(
    current_user: User = Depends(get_current_agent_user)
):
    """Trigger an immediate check of all tickets for escalation"""
    task = trigger_escalation_check()
    return {
        "message": "Escalation check triggered",
        "task_id": str(task.id) if hasattr(task, 'id') else None
    }


@router.post("/check-ticket/{ticket_id}")
async def trigger_ticket_check_endpoint(
    ticket_id: PydanticObjectId,
    current_user: User = Depends(get_current_agent_user)
):
    """Trigger escalation check for a specific ticket"""
    task = trigger_ticket_escalation_check(str(ticket_id))
    return {
        "message": f"Escalation check triggered for ticket {ticket_id}",
        "task_id": str(task.id) if hasattr(task, 'id') else None
    }
