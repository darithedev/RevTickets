from src.models.ticket import Ticket
from src.models.user import User
from src.models.agent_info import AgentInfo
from src.models.category import Category
from src.models.enums import TicketStatus
from src.langchain_app.chains.agent_assignment import analyze_agent_assignment
from beanie import PydanticObjectId
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone


class AssignmentService:
    """Service for AI-powered automatic agent assignment"""

    @staticmethod
    async def get_agent_workload(agent_id: PydanticObjectId) -> int:
        """Count active tickets for a specific agent"""
        all_tickets = await Ticket.find_all().to_list()
        active_count = 0
        for ticket in all_tickets:
            if (ticket.agent_id and
                hasattr(ticket.agent_id, 'id') and
                ticket.agent_id.id == agent_id and
                ticket.status in [TicketStatus.new, TicketStatus.in_progress, TicketStatus.waiting_for_customer]):
                active_count += 1
        return active_count

    @staticmethod
    async def get_available_agents(category_id: Optional[PydanticObjectId] = None) -> List[Dict[str, Any]]:
        """
        Get list of available agents with their workload information.
        If category_id is provided, prioritize agents with that specialization.
        """
        agents_data = []

        # Get all agent infos
        all_agent_infos = await AgentInfo.find_all().to_list()

        for agent_info in all_agent_infos:
            try:
                # Fetch the user object
                user = await agent_info.user.fetch()
                if not user:
                    continue

                # Get agent's category specialization
                category_name = None
                category_match = False
                if agent_info.category:
                    if hasattr(agent_info.category, 'fetch'):
                        cat = await agent_info.category.fetch()
                        if cat:
                            category_name = cat.name
                            if category_id and cat.id == category_id:
                                category_match = True
                    elif hasattr(agent_info.category, 'name'):
                        category_name = agent_info.category.name
                        if category_id and agent_info.category.id == category_id:
                            category_match = True

                # Get actual workload - DO NOT normalize or modify this value
                active_ticket_count = await AssignmentService.get_agent_workload(user.id)

                agents_data.append({
                    "id": str(user.id),
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                    "category_name": category_name,
                    "category_match": category_match,
                    "active_ticket_count": active_ticket_count  # Raw count, not normalized
                })
            except Exception as e:
                print(f"Error processing agent info: {e}")
                continue

        return agents_data

    @staticmethod
    async def ai_assign_ticket(ticket: Ticket) -> Dict[str, Any]:
        """
        Use AI to analyze ticket and assign the best available agent.

        Returns:
            dict: {
                "success": bool,
                "agent": User object or None,
                "assignment_reason": str,
                "confidence": float
            }
        """
        try:
            # Get category information
            category = None
            category_id = None
            category_name = "Unknown"

            if ticket.category_id:
                if hasattr(ticket.category_id, 'fetch'):
                    category = await ticket.category_id.fetch()
                else:
                    category = ticket.category_id

                if category:
                    category_id = category.id
                    category_name = category.name

            # Get subcategory information
            subcategory_name = None
            if ticket.sub_category_id:
                if hasattr(ticket.sub_category_id, 'fetch'):
                    subcategory = await ticket.sub_category_id.fetch()
                else:
                    subcategory = ticket.sub_category_id
                if subcategory:
                    subcategory_name = subcategory.name

            # Prepare ticket data for AI analysis
            ticket_data = {
                "title": ticket.title,
                "description": ticket.description,
                "category_name": category_name,
                "subcategory_name": subcategory_name,
                "priority": ticket.priority.value if hasattr(ticket.priority, 'value') else str(ticket.priority),
                "tags": []
            }

            # Extract tags if available
            if ticket.tag_ids:
                for tag_dict in ticket.tag_ids:
                    for key, value in tag_dict.items():
                        ticket_data["tags"].append(f"{key}: {value}" if value else key)

            # Get available agents with actual workload
            agents_data = await AssignmentService.get_available_agents(category_id)

            if not agents_data:
                return {
                    "success": False,
                    "agent": None,
                    "assignment_reason": "No agents available in the system",
                    "confidence": 0
                }

            # Use AI to analyze and select the best agent
            ai_result = await analyze_agent_assignment(ticket_data, agents_data)

            if not ai_result.get("selected_agent_id"):
                # Fallback: select agent with lowest workload
                best_agent_data = min(agents_data, key=lambda x: x["active_ticket_count"])
                agent = await User.get(best_agent_data["id"])

                return {
                    "success": True,
                    "agent": agent,
                    "assignment_reason": f"Fallback assignment: {ai_result.get('reasoning', 'AI could not determine best agent, assigned to agent with lowest workload')}",
                    "confidence": 0.3
                }

            # Get the selected agent
            selected_agent = await User.get(ai_result["selected_agent_id"])

            if not selected_agent:
                # Fallback if agent ID is invalid
                best_agent_data = min(agents_data, key=lambda x: x["active_ticket_count"])
                agent = await User.get(best_agent_data["id"])

                return {
                    "success": True,
                    "agent": agent,
                    "assignment_reason": f"Fallback assignment: Selected agent not found, assigned to agent with lowest workload",
                    "confidence": 0.3
                }

            return {
                "success": True,
                "agent": selected_agent,
                "assignment_reason": ai_result.get("reasoning", "AI-powered assignment"),
                "confidence": ai_result.get("confidence", 0.5),
                "factors": ai_result.get("factors", [])
            }

        except Exception as e:
            print(f"Error in AI agent assignment: {e}")

            # Fallback to simple assignment
            try:
                agents_data = await AssignmentService.get_available_agents()
                if agents_data:
                    best_agent_data = min(agents_data, key=lambda x: x["active_ticket_count"])
                    agent = await User.get(best_agent_data["id"])

                    return {
                        "success": True,
                        "agent": agent,
                        "assignment_reason": f"Fallback assignment due to error: {str(e)}",
                        "confidence": 0.1
                    }
            except Exception as fallback_error:
                print(f"Fallback assignment also failed: {fallback_error}")

            return {
                "success": False,
                "agent": None,
                "assignment_reason": f"Assignment failed: {str(e)}",
                "confidence": 0
            }

    @staticmethod
    async def reassign_ticket_ai(ticket_id: PydanticObjectId) -> Dict[str, Any]:
        """
        Reassign an existing ticket using AI analysis.
        """
        ticket = await Ticket.get(ticket_id)
        if not ticket:
            return {
                "success": False,
                "agent": None,
                "assignment_reason": "Ticket not found",
                "confidence": 0
            }

        result = await AssignmentService.ai_assign_ticket(ticket)

        if result["success"] and result["agent"]:
            ticket.agent_id = result["agent"]
            ticket.status = TicketStatus.in_progress
            ticket.updated_at = datetime.now(timezone.utc)
            await ticket.save()

        return result
