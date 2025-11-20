from src.models.article import Article
from src.langchain_app.chains.kb_chat import generate_kb_response, generate_ticket_from_chat
from typing import List, Optional
from datetime import datetime, timezone

class KBChatService:
    @staticmethod
    async def search_articles(query: str, limit: int = 5) -> List[dict]:
        """Search articles by text matching for RAG context."""
        all_articles = await Article.find_all().to_list()

        # Simple text-based search (can be enhanced with vector search later)
        query_lower = query.lower()
        query_terms = query_lower.split()

        scored_articles = []
        for article in all_articles:
            score = 0

            # Get text content
            content_text = ""
            if hasattr(article.content, 'text'):
                content_text = article.content.text
            elif isinstance(article.content, dict):
                content_text = article.content.get('text', '')

            title_lower = article.title.lower()
            content_lower = content_text.lower()

            # Score based on term matches
            for term in query_terms:
                if term in title_lower:
                    score += 3  # Higher weight for title matches
                if term in content_lower:
                    score += 1

            # Check AI-generated tags
            if article.ai_generated_tags:
                for tag in article.ai_generated_tags:
                    if any(term in tag.lower() for term in query_terms):
                        score += 2

            if score > 0:
                scored_articles.append((article, score))

        # Sort by score and return top results
        scored_articles.sort(key=lambda x: x[1], reverse=True)
        top_articles = scored_articles[:limit]

        return [article for article, score in top_articles]

    @staticmethod
    async def chat(
        query: str,
        chat_history: Optional[List[dict]] = None,
        session_id: Optional[str] = None
    ) -> dict:
        """Process a chat query against the knowledge base using RAG."""

        # Search for relevant articles
        relevant_articles = await KBChatService.search_articles(query)

        # Format articles for the LLM
        context_articles = []
        for article in relevant_articles:
            # Handle linked objects
            category_name = "Uncategorized"
            if hasattr(article.category_id, 'fetch'):
                category = await article.category_id.fetch()
                if category:
                    category_name = category.name
            elif hasattr(article.category_id, 'name'):
                category_name = article.category_id.name

            # Get content text
            content_text = ""
            if hasattr(article.content, 'text'):
                content_text = article.content.text
            elif isinstance(article.content, dict):
                content_text = article.content.get('text', '')

            context_articles.append({
                'id': str(article.id),
                'title': article.title,
                'category': category_name,
                'content': content_text[:2000]  # Limit content length for context
            })

        # Generate response using LangChain
        response = await generate_kb_response(
            query=query,
            context_articles=context_articles,
            chat_history=chat_history
        )

        return {
            'answer': response.get('answer', 'I could not find relevant information.'),
            'sources': response.get('sources', []),
            'suggested_actions': response.get('suggested_actions', []),
            'session_id': session_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def generate_ticket_suggestion(
        chat_history: List[dict],
        user_query: str
    ) -> dict:
        """Generate ticket suggestion from chat conversation."""

        ticket_data = await generate_ticket_from_chat(chat_history, user_query)

        return {
            'title': ticket_data.get('title', ''),
            'description': ticket_data.get('description', ''),
            'priority': ticket_data.get('priority', 'medium'),
            'suggested_category': ticket_data.get('suggested_category', '')
        }

    @staticmethod
    async def get_related_articles(article_id: str, limit: int = 3) -> List[dict]:
        """Get articles related to a specific article."""

        # Get the source article
        from beanie import PydanticObjectId
        article = await Article.get(PydanticObjectId(article_id))

        if not article:
            return []

        # Build search query from article title and tags
        search_terms = article.title.split()
        if article.ai_generated_tags:
            search_terms.extend(article.ai_generated_tags[:3])

        query = " ".join(search_terms)

        # Search for related articles
        related = await KBChatService.search_articles(query, limit=limit + 1)

        # Filter out the source article
        related_articles = []
        for rel_article in related:
            if str(rel_article.id) != article_id:
                # Handle linked objects
                category_name = "Uncategorized"
                if hasattr(rel_article.category_id, 'fetch'):
                    category = await rel_article.category_id.fetch()
                    if category:
                        category_name = category.name
                elif hasattr(rel_article.category_id, 'name'):
                    category_name = rel_article.category_id.name

                related_articles.append({
                    'id': str(rel_article.id),
                    'title': rel_article.title,
                    'category': category_name
                })

        return related_articles[:limit]
