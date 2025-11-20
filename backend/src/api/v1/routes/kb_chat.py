from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from src.services.kb_chat_service import KBChatService
from src.utils.security import get_current_user

router = APIRouter(prefix="/kb-chat", tags=["Knowledge Base Chat"])


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    query: str = Field(..., description="User's question")
    chat_history: Optional[List[ChatMessage]] = Field(default=None, description="Previous chat messages")
    session_id: Optional[str] = Field(default=None, description="Chat session identifier")


class ChatSource(BaseModel):
    id: str
    title: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource]
    suggested_actions: Optional[List[str]] = None
    session_id: Optional[str] = None
    timestamp: str


class TicketSuggestionRequest(BaseModel):
    chat_history: List[ChatMessage]
    user_query: str


class TicketSuggestion(BaseModel):
    title: str
    description: str
    priority: str
    suggested_category: str


class RelatedArticle(BaseModel):
    id: str
    title: str
    category: str


@router.post("/chat", response_model=ChatResponse)
async def chat_with_kb(request: ChatRequest, current_user=Depends(get_current_user)):
    """
    Chat with the knowledge base using natural language queries.
    Uses RAG to retrieve relevant articles and generate contextual responses.
    """
    try:
        # Convert chat history to dict format
        history = None
        if request.chat_history:
            history = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]

        response = await KBChatService.chat(
            query=request.query,
            chat_history=history,
            session_id=request.session_id
        )

        return ChatResponse(
            answer=response['answer'],
            sources=[ChatSource(**source) for source in response['sources']],
            suggested_actions=response.get('suggested_actions'),
            session_id=response.get('session_id'),
            timestamp=response['timestamp']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/suggest-ticket", response_model=TicketSuggestion)
async def suggest_ticket_from_chat(
    request: TicketSuggestionRequest,
    current_user=Depends(get_current_user)
):
    """
    Generate ticket suggestion from chat conversation.
    Useful for converting chat sessions into support tickets.
    """
    try:
        history = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]

        suggestion = await KBChatService.generate_ticket_suggestion(
            chat_history=history,
            user_query=request.user_query
        )

        return TicketSuggestion(**suggestion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket suggestion error: {str(e)}")


@router.get("/related/{article_id}", response_model=List[RelatedArticle])
async def get_related_articles(
    article_id: str,
    limit: int = 3,
    current_user=Depends(get_current_user)
):
    """
    Get articles related to a specific article.
    Useful for suggesting additional reading.
    """
    try:
        related = await KBChatService.get_related_articles(article_id, limit)
        return [RelatedArticle(**article) for article in related]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching related articles: {str(e)}")
