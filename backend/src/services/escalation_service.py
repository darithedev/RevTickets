# src/services/escalation_service.py
from src.models.escalation import (
    EscalationRule,
    EscalationHistory,
    AgentTier,
    EscalationTriggerType,
    EscalationActionType,
    EscalationLevel
)
from src.models.ticket import Ticket
from src.models.user import User
from src.models.enums import TicketStatus, TicketPriority
from beanie import PydanticObjectId
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException


class EscalationService:
    """Service for managing ticket escalations and automatic reassignments"""

    # Priority escalation order
    PRIORITY_ORDER = {
        "low": 0,
        "medium": 1,
        "high": 2,
        "critical": 3
    }

    TIER_ORDER = {
        EscalationLevel.tier_1: 1,
        EscalationLevel.tier_2: 2,
        EscalationLevel.tier_3: 3,
        EscalationLevel.manager: 4
    }

    # === ESCALATION RULES CRUD ===

    @staticmethod
    async def create_rule(rule_data: dict, created_by: User) -> EscalationRule:
        """Create a new escalation rule"""
        rule = EscalationRule(
            **rule_data,
            created_by=created_by,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        await rule.insert()
        return rule

    @staticmethod
    async def get_all_rules(active_only: bool = False) -> List[EscalationRule]:
        """Get all escalation rules, optionally filtered by active status"""
        if active_only:
            rules = await EscalationRule.find({"is_active": True}).sort("priority_order").to_list()
        else:
            rules = await EscalationRule.find_all().sort("priority_order").to_list()
        return rules

    @staticmethod
    async def get_rule(rule_id: PydanticObjectId) -> Optional[EscalationRule]:
        """Get a specific escalation rule"""
        return await EscalationRule.get(rule_id)

    @staticmethod
    async def update_rule(rule_id: PydanticObjectId, update_data: dict) -> Optional[EscalationRule]:
        """Update an escalation rule"""
        rule = await EscalationRule.get(rule_id)
        if not rule:
            return None

        update_data["updated_at"] = datetime.now(timezone.utc)
        await rule.set(update_data)
        return rule

    @staticmethod
    async def delete_rule(rule_id: PydanticObjectId) -> bool:
        """Delete an escalation rule"""
        rule = await EscalationRule.get(rule_id)
        if not rule:
            return False
        await rule.delete()
        return True

    @staticmethod
    async def toggle_rule(rule_id: PydanticObjectId) -> Optional[EscalationRule]:
        """Toggle an escalation rule's active status"""
        rule = await EscalationRule.get(rule_id)
        if not rule:
            return None

        rule.is_active = not rule.is_active
        rule.updated_at = datetime.now(timezone.utc)
        await rule.save()
        return rule

    # === ESCALATION HISTORY ===

    @staticmethod
    async def get_ticket_escalation_history(ticket_id: PydanticObjectId) -> List[Dict[str, Any]]:
        """Get escalation history for a specific ticket"""
        histories = await EscalationHistory.find(
            {"ticketId.$id": ticket_id}
        ).sort("-escalatedAt").to_list()

        result = []
        for history in histories:
            # Fetch related data
            previous_agent = None
            new_agent = None
            escalated_by = None

            if history.previous_agent_id:
                try:
                    previous_agent = await history.previous_agent_id.fetch()
                except:
                    pass

            if history.new_agent_id:
                try:
                    new_agent = await history.new_agent_id.fetch()
                except:
                    pass

            if history.escalated_by:
                try:
                    escalated_by = await history.escalated_by.fetch()
                except:
                    pass

            result.append({
                "id": str(history.id),
                "escalation_level": history.escalation_level.value,
                "trigger_type": history.trigger_type.value,
                "action_taken": history.action_taken.value,
                "previous_agent": {
                    "id": str(previous_agent.id),
                    "name": f"{previous_agent.first_name} {previous_agent.last_name}",
                    "email": previous_agent.email
                } if previous_agent else None,
                "new_agent": {
                    "id": str(new_agent.id),
                    "name": f"{new_agent.first_name} {new_agent.last_name}",
                    "email": new_agent.email
                } if new_agent else None,
                "previous_priority": history.previous_priority,
                "new_priority": history.new_priority,
                "reason": history.reason,
                "notes": history.notes,
                "is_automatic": history.is_automatic,
                "escalated_at": history.escalated_at.isoformat(),
                "escalated_by": {
                    "id": str(escalated_by.id),
                    "name": f"{escalated_by.first_name} {escalated_by.last_name}",
                    "email": escalated_by.email
                } if escalated_by else None
            })

        return result

    @staticmethod
    async def create_escalation_history(
        ticket: Ticket,
        rule: Optional[EscalationRule],
        escalation_level: EscalationLevel,
        trigger_type: EscalationTriggerType,
        action_taken: EscalationActionType,
        previous_agent: Optional[User],
        new_agent: Optional[User],
        previous_priority: Optional[str],
        new_priority: Optional[str],
        reason: str,
        notes: Optional[str] = None,
        is_automatic: bool = True,
        escalated_by: Optional[User] = None
    ) -> EscalationHistory:
        """Record an escalation event"""
        history = EscalationHistory(
            ticket_id=ticket,
            rule_id=rule,
            escalation_level=escalation_level,
            trigger_type=trigger_type,
            action_taken=action_taken,
            previous_agent_id=previous_agent,
            new_agent_id=new_agent,
            previous_priority=previous_priority,
            new_priority=new_priority,
            reason=reason,
            notes=notes,
            is_automatic=is_automatic,
            escalated_by=escalated_by
        )
        await history.insert()
        return history

    # === AGENT TIERS ===

    @staticmethod
    async def set_agent_tier(user_id: PydanticObjectId, tier: EscalationLevel, category_ids: List[str] = None, max_tickets: int = 10) -> AgentTier:
        """Set or update an agent's tier level"""
        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if agent tier already exists
        existing = await AgentTier.find_one({"userId.$id": user_id})

        if existing:
            existing.tier = tier
            existing.max_tickets = max_tickets
            existing.updated_at = datetime.now(timezone.utc)
            await existing.save()
            return existing

        # Create new agent tier
        agent_tier = AgentTier(
            user_id=user,
            tier=tier,
            max_tickets=max_tickets
        )
        await agent_tier.insert()
        return agent_tier

    @staticmethod
    async def get_agent_tier(user_id: PydanticObjectId) -> Optional[AgentTier]:
        """Get an agent's tier information"""
        return await AgentTier.find_one({"userId.$id": user_id})

    @staticmethod
    async def get_agents_by_tier(tier: EscalationLevel) -> List[AgentTier]:
        """Get all agents in a specific tier"""
        return await AgentTier.find({"tier": tier.value, "is_available": True}).to_list()

    # === ESCALATION LOGIC ===

    @staticmethod
    async def check_ticket_for_escalation(ticket: Ticket) -> Optional[EscalationRule]:
        """
        Check if a ticket should be escalated based on active rules.
        Returns the first matching rule or None.
        """
        # Get active rules sorted by priority
        rules = await EscalationService.get_all_rules(active_only=True)

        for rule in rules:
            if await EscalationService._rule_matches_ticket(rule, ticket):
                return rule

        return None

    @staticmethod
    async def _rule_matches_ticket(rule: EscalationRule, ticket: Ticket) -> bool:
        """Check if a specific rule matches a ticket"""
        # Check category restriction
        if rule.category_id:
            try:
                rule_category = await rule.category_id.fetch()
                ticket_category_id = None
                if hasattr(ticket.category_id, 'id'):
                    ticket_category_id = ticket.category_id.id
                elif hasattr(ticket.category_id, 'fetch'):
                    cat = await ticket.category_id.fetch()
                    ticket_category_id = cat.id

                if rule_category.id != ticket_category_id:
                    return False
            except:
                pass

        # Check priority restriction
        if rule.applies_to_priorities and ticket.priority.value not in rule.applies_to_priorities:
            return False

        # Check trigger conditions
        if rule.trigger_type == EscalationTriggerType.time_based:
            if rule.trigger_minutes:
                age_minutes = (datetime.now(timezone.utc) - ticket.created_at).total_seconds() / 60
                if age_minutes < rule.trigger_minutes:
                    return False

        elif rule.trigger_type == EscalationTriggerType.priority_based:
            if rule.trigger_priority and ticket.priority.value != rule.trigger_priority:
                return False

        elif rule.trigger_type == EscalationTriggerType.no_response:
            # Check if there's no agent response after X minutes
            if rule.trigger_minutes:
                age_minutes = (datetime.now(timezone.utc) - ticket.updated_at).total_seconds() / 60
                if age_minutes < rule.trigger_minutes:
                    return False

        # Check additional conditions
        if rule.conditions:
            for condition in rule.conditions:
                if not await EscalationService._check_condition(ticket, condition):
                    return False

        return True

    @staticmethod
    async def _check_condition(ticket: Ticket, condition: dict) -> bool:
        """Check a single condition against a ticket"""
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")

        # Get the ticket field value
        ticket_value = None
        if field == "priority":
            ticket_value = ticket.priority.value
        elif field == "status":
            ticket_value = ticket.status.value
        elif field == "age_minutes":
            ticket_value = (datetime.now(timezone.utc) - ticket.created_at).total_seconds() / 60

        if ticket_value is None:
            return False

        # Apply operator
        if operator == "equals":
            return str(ticket_value) == str(value)
        elif operator == "not_equals":
            return str(ticket_value) != str(value)
        elif operator == "greater_than":
            return float(ticket_value) > float(value)
        elif operator == "less_than":
            return float(ticket_value) < float(value)
        elif operator == "contains":
            return str(value) in str(ticket_value)

        return False

    @staticmethod
    async def execute_escalation(ticket: Ticket, rule: EscalationRule, manual_by: Optional[User] = None) -> Dict[str, Any]:
        """
        Execute an escalation action on a ticket.
        Returns details about what was done.
        """
        previous_agent = None
        new_agent = None
        previous_priority = ticket.priority.value
        new_priority = None

        # Get previous agent if exists
        if ticket.agent_id:
            try:
                if hasattr(ticket.agent_id, 'fetch'):
                    previous_agent = await ticket.agent_id.fetch()
                else:
                    previous_agent = ticket.agent_id
            except:
                pass

        # Execute the action
        if rule.action_type in [EscalationActionType.reassign, EscalationActionType.reassign_and_notify]:
            if rule.target_agent_id:
                # Reassign to specific agent
                try:
                    new_agent = await rule.target_agent_id.fetch()
                    ticket.agent_id = new_agent
                except:
                    pass
            elif rule.target_tier:
                # Reassign to agent in higher tier
                new_agent = await EscalationService._get_best_agent_in_tier(rule.target_tier, ticket)
                if new_agent:
                    ticket.agent_id = new_agent

        elif rule.action_type == EscalationActionType.reassign_to_tier:
            if rule.target_tier:
                new_agent = await EscalationService._get_best_agent_in_tier(rule.target_tier, ticket)
                if new_agent:
                    ticket.agent_id = new_agent

        # Handle priority increase
        if rule.action_type == EscalationActionType.increase_priority or rule.increase_priority_to:
            if rule.increase_priority_to:
                new_priority = rule.increase_priority_to
            else:
                # Increase by one level
                current_order = EscalationService.PRIORITY_ORDER.get(ticket.priority.value, 0)
                for priority, order in EscalationService.PRIORITY_ORDER.items():
                    if order == current_order + 1:
                        new_priority = priority
                        break

            if new_priority:
                ticket.priority = TicketPriority(new_priority)

        # Update ticket
        ticket.updated_at = datetime.now(timezone.utc)
        await ticket.save()

        # Determine escalation level
        escalation_level = rule.target_tier or EscalationLevel.tier_2

        # Record history
        reason = f"Escalation triggered by rule: {rule.name}"
        if rule.trigger_type == EscalationTriggerType.time_based:
            reason = f"Ticket exceeded {rule.trigger_minutes} minutes without resolution"
        elif rule.trigger_type == EscalationTriggerType.priority_based:
            reason = f"High priority ticket requires immediate attention"
        elif rule.trigger_type == EscalationTriggerType.no_response:
            reason = f"No agent response after {rule.trigger_minutes} minutes"

        history = await EscalationService.create_escalation_history(
            ticket=ticket,
            rule=rule,
            escalation_level=escalation_level,
            trigger_type=rule.trigger_type,
            action_taken=rule.action_type,
            previous_agent=previous_agent,
            new_agent=new_agent,
            previous_priority=previous_priority,
            new_priority=new_priority,
            reason=reason,
            is_automatic=manual_by is None,
            escalated_by=manual_by
        )

        return {
            "success": True,
            "ticket_id": str(ticket.id),
            "rule_name": rule.name,
            "action_taken": rule.action_type.value,
            "previous_agent": f"{previous_agent.first_name} {previous_agent.last_name}" if previous_agent else None,
            "new_agent": f"{new_agent.first_name} {new_agent.last_name}" if new_agent else None,
            "previous_priority": previous_priority,
            "new_priority": new_priority,
            "history_id": str(history.id)
        }

    @staticmethod
    async def _get_best_agent_in_tier(tier: EscalationLevel, ticket: Ticket) -> Optional[User]:
        """Find the best available agent in a tier for a ticket"""
        agent_tiers = await EscalationService.get_agents_by_tier(tier)

        if not agent_tiers:
            return None

        best_agent = None
        min_tickets = float('inf')

        for agent_tier in agent_tiers:
            try:
                user = await agent_tier.user_id.fetch()

                # Count current active tickets
                all_tickets = await Ticket.find_all().to_list()
                active_count = 0
                for t in all_tickets:
                    if (t.agent_id and hasattr(t.agent_id, 'id') and
                        t.agent_id.id == user.id and
                        t.status in [TicketStatus.new, TicketStatus.in_progress, TicketStatus.waiting_for_customer]):
                        active_count += 1

                # Check if under max tickets and has lowest load
                if active_count < agent_tier.max_tickets and active_count < min_tickets:
                    min_tickets = active_count
                    best_agent = user
            except:
                continue

        return best_agent

    @staticmethod
    async def manual_escalate(
        ticket_id: PydanticObjectId,
        target_tier: EscalationLevel,
        reason: str,
        escalated_by: User,
        target_agent_id: Optional[PydanticObjectId] = None,
        increase_priority: bool = False
    ) -> Dict[str, Any]:
        """Manually escalate a ticket"""
        ticket = await Ticket.get(ticket_id)
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        previous_agent = None
        new_agent = None
        previous_priority = ticket.priority.value
        new_priority = None

        # Get previous agent
        if ticket.agent_id:
            try:
                if hasattr(ticket.agent_id, 'fetch'):
                    previous_agent = await ticket.agent_id.fetch()
                else:
                    previous_agent = ticket.agent_id
            except:
                pass

        # Assign to specific agent or find one in tier
        if target_agent_id:
            new_agent = await User.get(target_agent_id)
        else:
            new_agent = await EscalationService._get_best_agent_in_tier(target_tier, ticket)

        if new_agent:
            ticket.agent_id = new_agent

        # Increase priority if requested
        if increase_priority:
            current_order = EscalationService.PRIORITY_ORDER.get(ticket.priority.value, 0)
            for priority, order in EscalationService.PRIORITY_ORDER.items():
                if order == current_order + 1:
                    new_priority = priority
                    ticket.priority = TicketPriority(new_priority)
                    break

        # Update ticket
        ticket.updated_at = datetime.now(timezone.utc)
        await ticket.save()

        # Record history
        history = await EscalationService.create_escalation_history(
            ticket=ticket,
            rule=None,
            escalation_level=target_tier,
            trigger_type=EscalationTriggerType.customer_request,
            action_taken=EscalationActionType.reassign,
            previous_agent=previous_agent,
            new_agent=new_agent,
            previous_priority=previous_priority,
            new_priority=new_priority,
            reason=reason,
            is_automatic=False,
            escalated_by=escalated_by
        )

        return {
            "success": True,
            "ticket_id": str(ticket.id),
            "target_tier": target_tier.value,
            "previous_agent": f"{previous_agent.first_name} {previous_agent.last_name}" if previous_agent else None,
            "new_agent": f"{new_agent.first_name} {new_agent.last_name}" if new_agent else None,
            "previous_priority": previous_priority,
            "new_priority": new_priority,
            "history_id": str(history.id)
        }

    @staticmethod
    async def get_escalation_stats() -> Dict[str, Any]:
        """Get statistics about escalations"""
        all_histories = await EscalationHistory.find_all().to_list()

        # Count by trigger type
        by_trigger = {}
        for h in all_histories:
            trigger = h.trigger_type.value
            by_trigger[trigger] = by_trigger.get(trigger, 0) + 1

        # Count by action
        by_action = {}
        for h in all_histories:
            action = h.action_taken.value
            by_action[action] = by_action.get(action, 0) + 1

        # Count automatic vs manual
        automatic = sum(1 for h in all_histories if h.is_automatic)
        manual = len(all_histories) - automatic

        # Recent escalations (last 24 hours)
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)
        recent = sum(1 for h in all_histories if h.escalated_at > yesterday)

        return {
            "total_escalations": len(all_histories),
            "by_trigger_type": by_trigger,
            "by_action_type": by_action,
            "automatic": automatic,
            "manual": manual,
            "last_24_hours": recent
        }

    @staticmethod
    async def check_all_tickets_for_escalation() -> List[Dict[str, Any]]:
        """
        Check all active tickets for escalation.
        Used by the monitoring task.
        """
        results = []

        # Get all active tickets
        all_tickets = await Ticket.find_all().to_list()
        active_tickets = [
            t for t in all_tickets
            if t.status in [TicketStatus.new, TicketStatus.in_progress, TicketStatus.waiting_for_customer, TicketStatus.waiting_for_agent]
        ]

        for ticket in active_tickets:
            try:
                rule = await EscalationService.check_ticket_for_escalation(ticket)
                if rule:
                    # Check if already escalated by this rule recently
                    recent_history = await EscalationHistory.find({
                        "ticketId.$id": ticket.id,
                        "ruleId.$id": rule.id
                    }).to_list()

                    # Skip if escalated by same rule in last hour
                    if recent_history:
                        last_escalation = max(h.escalated_at for h in recent_history)
                        if datetime.now(timezone.utc) - last_escalation < timedelta(hours=1):
                            continue

                    result = await EscalationService.execute_escalation(ticket, rule)
                    results.append(result)
            except Exception as e:
                print(f"Error checking ticket {ticket.id} for escalation: {e}")
                continue

        return results
