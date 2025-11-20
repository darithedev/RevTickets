from src.services.sentiment_service import SentimentService
from src.utils.security import get_current_agent_user
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional


router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"], dependencies=[Depends(get_current_agent_user)])


@router.get("/ticket/{ticket_id}")
async def analyze_ticket(ticket_id: str):
    """Analyze sentiment of a ticket's description."""
    try:
        result = await SentimentService.analyze_ticket_sentiment(ticket_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comment/{comment_id}")
async def analyze_comment(comment_id: str):
    """Analyze sentiment of a specific comment."""
    try:
        result = await SentimentService.analyze_comment_sentiment(comment_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket/{ticket_id}/full")
async def analyze_ticket_full(ticket_id: str):
    """Analyze sentiment of ticket and all its comments."""
    try:
        result = await SentimentService.analyze_ticket_with_comments(ticket_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket/{ticket_id}/escalation")
async def check_escalation(ticket_id: str):
    """Check if a ticket should be escalated based on sentiment analysis."""
    try:
        result = await SentimentService.check_escalation_needed(ticket_id)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_analytics(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze"),
    category_id: Optional[str] = Query(default=None, description="Filter by category ID"),
    agent_id: Optional[str] = Query(default=None, description="Filter by agent ID")
):
    """Get sentiment analytics for tickets over a time period."""
    try:
        result = await SentimentService.get_sentiment_analytics(
            days=days,
            category_id=category_id,
            agent_id=agent_id
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
