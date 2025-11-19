from src.langchain_app.config.model_config import llm
import json
from typing import List, Dict, Any

async def analyze_agent_assignment(ticket_data: dict, agents_data: List[dict]) -> dict:
    """
    Use AI to analyze ticket information and available agents to determine
    the best agent assignment based on category specialization and workload.
    """
    agents_info = []
    for agent in agents_data:
        agent_str = f"Agent ID: {agent['id']}\nName: {agent['name']}\nEmail: {agent['email']}\nCategory: {agent.get('category_name', 'None')}\nActive Tickets: {agent['active_ticket_count']}\n---"
        agents_info.append(agent_str)

    agents_list = "\n".join(agents_info)
    ticket_info = f"Title: {ticket_data['title']}\nDescription: {ticket_data['description']}\nCategory: {ticket_data['category_name']}\nPriority: {ticket_data['priority']}"

    system_prompt = """You are an intelligent ticket routing system. Select the best agent based on:
1. CATEGORY MATCH: Prefer agents specialized in the ticket's category
2. WORKLOAD BALANCE: Consider agents with fewer active tickets
3. PRIORITY HANDLING: For critical tickets, prioritize skill match

Respond ONLY with JSON:
{"selected_agent_id": "agent_id_string", "confidence": 0.0-1.0, "reasoning": "brief explanation", "factors": ["list", "of", "factors"]}"""

    user_prompt = f"TICKET:\n{ticket_info}\n\nAVAILABLE AGENTS:\n{agents_list}\n\nSelect the best agent."

    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]

    try:
        response = await llm.ainvoke(messages)
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()
        result = json.loads(content)
        return {
            "selected_agent_id": result.get("selected_agent_id"),
            "confidence": result.get("confidence", 0.5),
            "reasoning": result.get("reasoning", "AI analysis completed"),
            "factors": result.get("factors", [])
        }
    except Exception as e:
        print(f"Error in AI agent assignment: {e}")
        return {"selected_agent_id": None, "confidence": 0, "reasoning": f"Error: {str(e)}", "factors": ["error"]}
