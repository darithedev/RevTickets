from src.langchain_app.config.model_config import llm
import json
from typing import List, Dict, Any

async def analyze_agent_assignment(ticket_data: dict, agents_data: List[dict]) -> dict:
    """
    Use AI to analyze ticket information and available agents to determine
    the best agent assignment based on:
    - Category specialization match
    - Agent workload (number of active tickets)
    - Ticket priority and complexity

    Returns:
        dict: {
            "selected_agent_id": str,
            "confidence": float (0-1),
            "reasoning": str,
            "factors": list of factors considered
        }
    """

    # Build agent information string
    agents_info = []
    for agent in agents_data:
        agent_str = (
            f"Agent ID: {agent['id']}\n"
            f"Name: {agent['name']}\n"
            f"Email: {agent['email']}\n"
            f"Category Specialization: {agent.get('category_name', 'None')}\n"
            f"Active Tickets: {agent['active_ticket_count']}\n"
            f"---"
        )
        agents_info.append(agent_str)

    agents_list = "\n".join(agents_info)

    # Build ticket information
    ticket_info = (
        f"Ticket Title: {ticket_data['title']}\n"
        f"Description: {ticket_data['description']}\n"
        f"Category: {ticket_data['category_name']}\n"
        f"Subcategory: {ticket_data.get('subcategory_name', 'N/A')}\n"
        f"Priority: {ticket_data['priority']}\n"
        f"Tags: {', '.join(ticket_data.get('tags', [])) if ticket_data.get('tags') else 'None'}"
    )

    system_prompt = """You are an intelligent ticket routing system for a customer support platform.
Your task is to analyze a support ticket and select the best available agent based on:

1. CATEGORY MATCH (Highest Priority): Prefer agents specialized in the ticket's category
2. WORKLOAD BALANCE: Consider agents with fewer active tickets to distribute work evenly
3. PRIORITY HANDLING: For critical/high priority tickets, prioritize agents with matching skills even if busier

Respond with a valid JSON object containing:
{
    "selected_agent_id": "the agent's ID string",
    "confidence": 0.0 to 1.0 indicating how confident you are in this selection,
    "reasoning": "Brief explanation of why this agent was selected",
    "factors": ["list", "of", "key", "factors", "considered"]
}

If no suitable agent is found, return:
{
    "selected_agent_id": null,
    "confidence": 0,
    "reasoning": "Explanation of why no agent could be selected",
    "factors": []
}

IMPORTANT: Respond ONLY with the JSON object, no additional text."""

    user_prompt = f"""Analyze this support ticket and select the best agent:

TICKET INFORMATION:
{ticket_info}

AVAILABLE AGENTS:
{agents_list}

Select the most appropriate agent and explain your reasoning."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = await llm.ainvoke(messages)
        content = response.content.strip()

        # Clean up the response - remove markdown code blocks if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        # Parse the JSON response
        result = json.loads(content)

        # Validate required fields
        if "selected_agent_id" not in result:
            result["selected_agent_id"] = None
        if "confidence" not in result:
            result["confidence"] = 0.5
        if "reasoning" not in result:
            result["reasoning"] = "AI analysis completed"
        if "factors" not in result:
            result["factors"] = []

        return result

    except json.JSONDecodeError as e:
        print(f"Failed to parse AI response as JSON: {e}")
        print(f"Response was: {response.content if response else 'No response'}")
        return {
            "selected_agent_id": None,
            "confidence": 0,
            "reasoning": "Failed to parse AI response",
            "factors": ["parsing_error"]
        }
    except Exception as e:
        print(f"Error in AI agent assignment analysis: {e}")
        return {
            "selected_agent_id": None,
            "confidence": 0,
            "reasoning": f"Error during analysis: {str(e)}",
            "factors": ["error"]
        }
