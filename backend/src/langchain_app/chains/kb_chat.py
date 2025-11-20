from src.langchain_app.config.model_config import llm
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel
from typing import List, Optional

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]
    suggested_actions: Optional[List[str]] = None

parser = JsonOutputParser(pydantic_object=ChatResponse)

async def generate_kb_response(query: str, context_articles: List[dict], chat_history: List[dict] = None) -> dict:
    """Generate a response to a knowledge base query using RAG."""

    # Format context from retrieved articles
    context_parts = []
    for i, article in enumerate(context_articles, 1):
        context_parts.append(
            f"[Article {i}]\n"
            f"ID: {article['id']}\n"
            f"Title: {article['title']}\n"
            f"Category: {article['category']}\n"
            f"Content: {article['content']}\n"
        )

    context = "\n---\n".join(context_parts) if context_parts else "No relevant articles found."

    # Format chat history
    history_text = ""
    if chat_history:
        history_parts = []
        for msg in chat_history[-5:]:  # Keep last 5 messages for context
            role = "User" if msg.get("role") == "user" else "Assistant"
            history_parts.append(f"{role}: {msg.get('content', '')}")
        history_text = "\n".join(history_parts)

    system_prompt = """You are a helpful knowledge base assistant for a ticketing system.
Your role is to answer questions based on the provided knowledge base articles.

Guidelines:
- Only answer based on the provided context from knowledge base articles
- If the answer is not in the provided articles, say so clearly
- Always cite which article(s) you used to answer
- Provide clear, concise answers
- If appropriate, suggest creating a support ticket for complex issues

Output in JSON format:
{
    "answer": "Your helpful answer here",
    "sources": [
        {"id": "article_id", "title": "Article Title"}
    ],
    "suggested_actions": ["Create a ticket", "View full article"] // Optional array
}
"""

    user_content = f"""
Previous conversation:
{history_text if history_text else "No previous messages."}

Knowledge Base Context:
{context}

User Question: {query}

Please provide a helpful answer based on the knowledge base articles above."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    chain = llm | parser

    response = await chain.ainvoke(messages)

    return response


async def generate_ticket_from_chat(chat_history: List[dict], user_query: str) -> dict:
    """Generate ticket details from a chat conversation."""

    # Format chat history
    history_parts = []
    for msg in chat_history:
        role = "User" if msg.get("role") == "user" else "Assistant"
        history_parts.append(f"{role}: {msg.get('content', '')}")
    history_text = "\n".join(history_parts)

    system_prompt = """You are a helpful assistant that creates support tickets from chat conversations.
Based on the conversation history, extract and generate appropriate ticket details.

Output in JSON format:
{
    "title": "Brief descriptive title for the ticket",
    "description": "Summary of the issue or request based on the conversation",
    "priority": "low|medium|high",
    "suggested_category": "Best guess for ticket category"
}
"""

    user_content = f"""
Chat Conversation:
{history_text}

Latest User Message: {user_query}

Please generate appropriate ticket details based on this conversation."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    class TicketSuggestion(BaseModel):
        title: str
        description: str
        priority: str
        suggested_category: str

    ticket_parser = JsonOutputParser(pydantic_object=TicketSuggestion)
    chain = llm | ticket_parser

    response = await chain.ainvoke(messages)

    return response
