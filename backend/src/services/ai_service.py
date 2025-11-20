from src.langchain_app.chains.summarize_ticket_data import summarize_ticket_data
from src.langchain_app.chains.generate_closing_comments import generate_closing_comments
from src.langchain_app.chains.generate_tags import generate_tags_for_article
from .ticket_service import TicketService
from .comment_service import CommentService
from .article_service import ArticleService
from src.schemas.summary import TicketSummaryResponse
from src.schemas.closing_comments import ClosingComments
from fastapi import HTTPException

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
    async def generate_article_tags(article_id: str) -> list[str]:
        """Generate AI-powered tags for a KB article."""
        article = await ArticleService.get_article(article_id)

        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Build data for tag generation
        article_data = {
            "title": article.title,
            "content": article.content.text if hasattr(article.content, 'text') else str(article.content),
            "category": article.category.name if article.category else None,
            "subcategory": article.subCategory.name if article.subCategory else None,
        }

        # Generate tags using AI
        tags = await generate_tags_for_article(article_data)

        # Update article with generated tags
        article.ai_generated_tags = tags
        await article.save()

        return tags

    @staticmethod
    async def generate_tags_from_content(title: str, content: str, category: str = None, subcategory: str = None) -> list[str]:
        """Generate AI-powered tags from article content without saving."""
        article_data = {
            "title": title,
            "content": content,
            "category": category,
            "subcategory": subcategory,
        }

        # Generate tags using AI
        tags = await generate_tags_for_article(article_data)
        return tags
