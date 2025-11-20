from src.langchain_app.chains.sentiment import analyze_sentiment, analyze_sentiment_batch, get_sentiment_trends
from .ticket_service import TicketService
from .comment_service import CommentService
from src.models.ticket import Ticket
from src.models.comment import Comment
from beanie import PydanticObjectId
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import HTTPException


class SentimentService:
    @staticmethod
    async def analyze_ticket_sentiment(ticket_id: str) -> dict:
        """Analyze sentiment of a ticket's description."""
        ticket = await TicketService.get_ticket(ticket_id)

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        # Get text content from ticket
        text = ticket.title + "\n\n"
        if hasattr(ticket.content, 'text'):
            text += ticket.content.text
        elif isinstance(ticket.content, str):
            text += ticket.content
        else:
            text += str(ticket.content)

        sentiment = await analyze_sentiment(text)

        return {
            "ticket_id": ticket_id,
            "sentiment": sentiment,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def analyze_comment_sentiment(comment_id: str) -> dict:
        """Analyze sentiment of a specific comment."""
        comment = await Comment.get(PydanticObjectId(comment_id))

        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

        # Get text content from comment
        if hasattr(comment.content, 'text'):
            text = comment.content.text
        elif isinstance(comment.content, str):
            text = comment.content
        else:
            text = str(comment.content)

        sentiment = await analyze_sentiment(text)

        return {
            "comment_id": comment_id,
            "sentiment": sentiment,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def analyze_ticket_with_comments(ticket_id: str) -> dict:
        """Analyze sentiment of ticket and all its comments."""
        ticket = await TicketService.get_ticket(ticket_id)

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        # Analyze ticket
        ticket_text = ticket.title + "\n\n"
        if hasattr(ticket.content, 'text'):
            ticket_text += ticket.content.text
        elif isinstance(ticket.content, str):
            ticket_text += ticket.content
        else:
            ticket_text += str(ticket.content)

        ticket_sentiment = await analyze_sentiment(ticket_text)

        # Fetch and analyze comments
        comments = await CommentService.get_comments_by_ticket(ticket_id)

        comment_sentiments = []
        for comment in comments:
            if hasattr(comment.content, 'text'):
                text = comment.content.text
            elif isinstance(comment.content, str):
                text = comment.content
            else:
                text = str(comment.content)

            sentiment = await analyze_sentiment(text)
            comment_sentiments.append({
                "comment_id": str(comment.id),
                "user_id": str(comment.user_id) if comment.user_id else None,
                "sentiment": sentiment,
                "created_at": comment.created_at.isoformat() if comment.created_at else None
            })

        # Calculate overall sentiment trend
        all_sentiments = [ticket_sentiment] + [cs["sentiment"] for cs in comment_sentiments]
        trends = await get_sentiment_trends(all_sentiments)

        return {
            "ticket_id": ticket_id,
            "ticket_sentiment": ticket_sentiment,
            "comment_sentiments": comment_sentiments,
            "overall_trends": trends,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def get_sentiment_analytics(
        days: int = 30,
        category_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> dict:
        """Get sentiment analytics for tickets over a time period."""
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)

        # Build query
        query = {"created_at": {"$gte": start_date, "$lte": end_date}}

        if category_id:
            query["category_id"] = PydanticObjectId(category_id)

        if agent_id:
            query["agent_id"] = PydanticObjectId(agent_id)

        # Fetch tickets
        tickets = await Ticket.find(query).to_list()

        if not tickets:
            return {
                "period_days": days,
                "total_tickets": 0,
                "sentiments_analyzed": 0,
                "average_score": 0,
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "escalation_rate": 0,
                "common_emotions": [],
                "daily_trends": []
            }

        # Analyze sentiments (limit to avoid rate limiting)
        max_tickets = min(len(tickets), 100)
        sentiments = []
        daily_data = {}

        for ticket in tickets[:max_tickets]:
            # Get text content
            text = ticket.title + "\n\n"
            if hasattr(ticket.content, 'text'):
                text += ticket.content.text
            elif isinstance(ticket.content, str):
                text += ticket.content
            else:
                text += str(ticket.content)

            try:
                sentiment = await analyze_sentiment(text)
                sentiments.append(sentiment)

                # Group by day
                day_key = ticket.created_at.strftime("%Y-%m-%d")
                if day_key not in daily_data:
                    daily_data[day_key] = []
                daily_data[day_key].append(sentiment)
            except Exception as e:
                print(f"Error analyzing ticket {ticket.id}: {e}")
                continue

        # Calculate overall trends
        trends = await get_sentiment_trends(sentiments)

        # Calculate daily trends
        daily_trends = []
        for day, day_sentiments in sorted(daily_data.items()):
            day_trends = await get_sentiment_trends(day_sentiments)
            daily_trends.append({
                "date": day,
                "count": len(day_sentiments),
                "average_score": day_trends["average_score"],
                "distribution": day_trends["sentiment_distribution"]
            })

        return {
            "period_days": days,
            "total_tickets": len(tickets),
            "sentiments_analyzed": len(sentiments),
            "average_score": trends["average_score"],
            "sentiment_distribution": trends["sentiment_distribution"],
            "escalation_rate": trends["escalation_rate"],
            "common_emotions": trends["common_emotions"],
            "daily_trends": daily_trends
        }

    @staticmethod
    async def check_escalation_needed(ticket_id: str) -> dict:
        """Check if a ticket should be escalated based on sentiment."""
        result = await SentimentService.analyze_ticket_with_comments(ticket_id)

        # Check ticket sentiment
        ticket_needs_escalation = result["ticket_sentiment"].get("escalation_recommended", False)

        # Check comment sentiments
        comment_escalations = sum(
            1 for cs in result["comment_sentiments"]
            if cs["sentiment"].get("escalation_recommended", False)
        )

        # Overall decision
        should_escalate = (
            ticket_needs_escalation or
            comment_escalations >= 2 or
            result["overall_trends"]["average_score"] < -0.5
        )

        return {
            "ticket_id": ticket_id,
            "should_escalate": should_escalate,
            "reasons": {
                "ticket_negative": ticket_needs_escalation,
                "negative_comments": comment_escalations,
                "average_score": result["overall_trends"]["average_score"],
                "escalation_rate": result["overall_trends"]["escalation_rate"]
            },
            "recommendation": "Escalate to senior agent" if should_escalate else "No escalation needed"
        }
