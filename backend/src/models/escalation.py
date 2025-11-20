# src/models/escalation.py
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
from .user import User
from .ticket import Ticket
from .category import Category


class EscalationTriggerType(str, Enum):
    """Types of triggers that can initiate an escalation"""
    time_based = "time_based"  # Escalate after X minutes/hours
    priority_based = "priority_based"  # Escalate based on ticket priority
    sla_breach = "sla_breach"  # Escalate when SLA is about to breach
    no_response = "no_response"  # Escalate when no agent response
    customer_request = "customer_request"  # Customer requested escalation


class EscalationActionType(str, Enum):
    """Types of actions to take when escalation triggers"""
    reassign = "reassign"  # Reassign to specific agent
    reassign_to_tier = "reassign_to_tier"  # Reassign to higher tier agent
    notify = "notify"  # Send notification only
    increase_priority = "increase_priority"  # Increase ticket priority
    reassign_and_notify = "reassign_and_notify"  # Both reassign and notify


class EscalationLevel(str, Enum):
    """Escalation level/tier"""
    tier_1 = "tier_1"
    tier_2 = "tier_2"
    tier_3 = "tier_3"
    manager = "manager"


class EscalationCondition(Document):
    """Individual condition within an escalation rule"""
    field: str = Field(..., description="Field to check (e.g., 'priority', 'status', 'age_minutes')")
    operator: str = Field(..., description="Comparison operator (e.g., 'equals', 'greater_than', 'contains')")
    value: str = Field(..., description="Value to compare against")


class EscalationRule(Document):
    """Defines when and how tickets should be escalated"""
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")
    name: str = Field(..., description="Name of the escalation rule")
    description: Optional[str] = Field(None, description="Description of the rule")

    # Rule configuration
    is_active: bool = Field(default=True, description="Whether this rule is active")
    priority_order: int = Field(default=0, description="Order in which rules are evaluated (lower = higher priority)")

    # Trigger configuration
    trigger_type: EscalationTriggerType = Field(..., description="Type of trigger for this rule")
    trigger_minutes: Optional[int] = Field(None, description="Minutes before escalation triggers (for time-based)")
    trigger_priority: Optional[str] = Field(None, description="Priority level that triggers escalation")

    # Conditions (optional additional conditions)
    conditions: Optional[List[dict]] = Field(default_factory=list, description="Additional conditions for the rule")

    # Action configuration
    action_type: EscalationActionType = Field(..., description="Action to take when triggered")
    target_agent_id: Optional[Link[User]] = Field(None, description="Specific agent to reassign to", alias="targetAgentId")
    target_tier: Optional[EscalationLevel] = Field(None, description="Tier to escalate to")
    increase_priority_to: Optional[str] = Field(None, description="New priority level after escalation")

    # Scope
    category_id: Optional[Link[Category]] = Field(None, description="Apply rule only to this category", alias="categoryId")
    applies_to_priorities: Optional[List[str]] = Field(default_factory=list, description="Priorities this rule applies to")

    # Notification settings
    notify_agents: Optional[List[Link[User]]] = Field(default_factory=list, description="Agents to notify on escalation")
    notification_message: Optional[str] = Field(None, description="Custom notification message")

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt")
    created_by: Optional[Link[User]] = Field(None, description="User who created this rule", alias="createdBy")

    class Settings:
        name = "escalation_rules"


class EscalationHistory(Document):
    """Records each escalation event for a ticket"""
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")

    # References
    ticket_id: Link[Ticket] = Field(..., description="Ticket that was escalated", alias="ticketId")
    rule_id: Optional[Link[EscalationRule]] = Field(None, description="Rule that triggered escalation", alias="ruleId")

    # Escalation details
    escalation_level: EscalationLevel = Field(..., description="Level escalated to")
    trigger_type: EscalationTriggerType = Field(..., description="What triggered the escalation")
    action_taken: EscalationActionType = Field(..., description="Action that was taken")

    # Assignment changes
    previous_agent_id: Optional[Link[User]] = Field(None, description="Agent before escalation", alias="previousAgentId")
    new_agent_id: Optional[Link[User]] = Field(None, description="Agent after escalation", alias="newAgentId")

    # Priority changes
    previous_priority: Optional[str] = Field(None, description="Priority before escalation")
    new_priority: Optional[str] = Field(None, description="Priority after escalation")

    # Additional info
    reason: str = Field(..., description="Human-readable reason for escalation")
    notes: Optional[str] = Field(None, description="Additional notes about the escalation")
    is_automatic: bool = Field(default=True, description="Whether this was an automatic escalation")

    # Timestamps
    escalated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="escalatedAt")
    escalated_by: Optional[Link[User]] = Field(None, description="User who initiated escalation (if manual)", alias="escalatedBy")

    class Settings:
        name = "escalation_history"


class AgentTier(Document):
    """Defines agent tier/level for escalation routing"""
    id: Optional[PydanticObjectId] = Field(default=None, alias="_id")

    user_id: Link[User] = Field(..., description="Agent user", alias="userId")
    tier: EscalationLevel = Field(..., description="Agent's escalation tier")

    # Specializations
    category_ids: Optional[List[Link[Category]]] = Field(default_factory=list, description="Categories this agent handles", alias="categoryIds")
    max_tickets: int = Field(default=10, description="Maximum concurrent tickets for this agent")

    # Availability
    is_available: bool = Field(default=True, description="Whether agent is available for assignments")

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="createdAt")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), alias="updatedAt")

    class Settings:
        name = "agent_tiers"
