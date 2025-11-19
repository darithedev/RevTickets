from src.langchain_app.chains.summarize_ticket_data import summarize_ticket_data
from src.langchain_app.chains.generate_closing_comments import generate_closing_comments
from src.langchain_app.chains.generate_tags import generate_tags
from .ticket_service import TicketService
from .comment_service import CommentService
from .article_service import ArticleService
from src.schemas.summary import TicketSummaryResponse
from src.schemas.closing_comments import ClosingComments
from src.models.article import Article
from beanie import PydanticObjectId
from datetime import datetime, timezone
from typing import List

class AIService:
    @staticmethod
    async def get_ticket_summary(ticket_id: str) -> str:
        ticket = await TicketService.get_ticket(ticket_id)

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        # Fetch comments separately if not linked
        comments = await CommentService.get_comments_by_ticket(ticket_id)

        # Build data for summary
        summary_data = {
            "title": ticket.title,
            "description": ticket.description,
            "category": ticket.category.name if ticket.category else "Uncategorized",
            "subcategory": ticket.subCategory.name if ticket.subCategory else "None",
            "tags": [{"key": tag.key, "value": tag.value } for tag in ticket.tagData] if ticket.tagData else [],
            "comments": [c.content for c in comments],
        }

        # Send to LangChain summary function
        summary = await summarize_ticket_data(summary_data)
        return TicketSummaryResponse(summary=summary)
    @staticmethod
    async def get_closing_comments(ticket_id: str) -> str:
        ticket = await TicketService.get_ticket(ticket_id)

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        # Fetch comments separately if not linked
        comments = await CommentService.get_comments_by_ticket(ticket_id)

        data = {
            "title": ticket.title,
            "description": ticket.description,
            "category": ticket.category.name if ticket.category else "Uncategorized",
            "subcategory": ticket.subCategory.name if ticket.subCategory else "None",
            "tags": [{"key": tag.key, "value": tag.value } for tag in ticket.tagData] if ticket.tagData else [],
            "comments": [c.content for c in comments],
        }

        comment = await generate_closing_comments(data)
        return comment

    @staticmethod
    async def generate_article_tags(article_id: str) -> List[str]:
        """Generate AI tags for a knowledge base article."""
        article = await Article.get(PydanticObjectId(article_id))

        if not article:
            raise ValueError("Article not found")

        # Get category and subcategory names
        if hasattr(article.category_id, 'fetch'):
            category = await article.category_id.fetch() if article.category_id else None
        else:
            category = article.category_id

        if hasattr(article.subcategory_id, 'fetch'):
            subcategory = await article.subcategory_id.fetch() if article.subcategory_id else None
        else:
            subcategory = article.subcategory_id

        # Build data for tag generation
        article_data = {
            "title": article.title,
            "category": category.name if category else "Uncategorized",
            "subcategory": subcategory.name if subcategory else "None",
            "content": article.content.text if hasattr(article.content, 'text') else str(article.content),
        }

        # Generate tags using LangChain
        generated_tags = await generate_tags(article_data)

        # Update article with generated tags
        article.ai_generated_tags = generated_tags
        article.updated_at = datetime.now(timezone.utc)
        await article.save()

        return generated_tags
