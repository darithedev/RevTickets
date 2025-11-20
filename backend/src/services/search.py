"""
Search service with proper index maintenance to prevent corruption.
"""

from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
import asyncio
import logging
from beanie import PydanticObjectId

from src.models.article import Article

logger = logging.getLogger(__name__)


class SearchIndexManager:
    """
    Manages search indexes for KB articles with proper maintenance and corruption prevention.
    """

    def __init__(self):
        self._index_lock = asyncio.Lock()
        self._last_rebuild_time: Optional[datetime] = None
        self._index_valid = False
        self._rebuild_in_progress = False

    async def ensure_indexes(self) -> bool:
        """
        Ensure all required indexes exist and are valid.
        Returns True if indexes are valid, False otherwise.
        """
        async with self._index_lock:
            try:
                # Get the collection
                collection = Article.get_motor_collection()

                # Create text index for search
                await collection.create_index(
                    [("title", "text"), ("content.text", "text")],
                    name="article_text_search",
                    default_language="english",
                    weights={"title": 10, "content.text": 5}
                )

                # Create index for category filtering
                await collection.create_index(
                    "category_id",
                    name="article_category_idx"
                )

                # Create index for subcategory filtering
                await collection.create_index(
                    "subcategory_id",
                    name="article_subcategory_idx"
                )

                # Create compound index for sorting
                await collection.create_index(
                    [("updated_at", -1), ("created_at", -1)],
                    name="article_date_idx"
                )

                self._index_valid = True
                self._last_rebuild_time = datetime.now(timezone.utc)
                logger.info("Search indexes created/verified successfully")
                return True

            except Exception as e:
                logger.error(f"Failed to create search indexes: {e}")
                self._index_valid = False
                return False

    async def rebuild_indexes(self, force: bool = False) -> bool:
        """
        Rebuild all search indexes. Use force=True to rebuild even if recently rebuilt.
        """
        if self._rebuild_in_progress:
            logger.warning("Index rebuild already in progress, skipping")
            return False

        # Check if rebuild is needed
        if not force and self._last_rebuild_time:
            time_since_rebuild = datetime.now(timezone.utc) - self._last_rebuild_time
            if time_since_rebuild.total_seconds() < 3600:  # Less than 1 hour
                logger.info("Indexes recently rebuilt, skipping")
                return True

        async with self._index_lock:
            self._rebuild_in_progress = True
            try:
                collection = Article.get_motor_collection()

                # Drop existing indexes (except _id)
                await collection.drop_indexes()
                logger.info("Dropped existing indexes")

                # Recreate indexes
                result = await self.ensure_indexes()
                return result

            except Exception as e:
                logger.error(f"Failed to rebuild indexes: {e}")
                self._index_valid = False
                return False

            finally:
                self._rebuild_in_progress = False

    async def search_articles(
        self,
        query: str,
        category_id: Optional[str] = None,
        subcategory_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Search articles with text search and optional filtering.
        Includes fallback mechanism if index is corrupted.
        """
        try:
            # Ensure indexes exist
            if not self._index_valid:
                await self.ensure_indexes()

            collection = Article.get_motor_collection()

            # Build search pipeline
            pipeline = []

            # Text search stage
            if query:
                pipeline.append({
                    "$match": {
                        "$text": {"$search": query}
                    }
                })
                # Add text score for relevance sorting
                pipeline.append({
                    "$addFields": {
                        "score": {"$meta": "textScore"}
                    }
                })

            # Category filter
            if category_id:
                pipeline.append({
                    "$match": {"category_id": PydanticObjectId(category_id)}
                })

            # Subcategory filter
            if subcategory_id:
                pipeline.append({
                    "$match": {"subcategory_id": PydanticObjectId(subcategory_id)}
                })

            # Sort by relevance (if text search) or date
            if query:
                pipeline.append({"$sort": {"score": -1}})
            else:
                pipeline.append({"$sort": {"updated_at": -1}})

            # Limit results
            pipeline.append({"$limit": limit})

            # Execute aggregation
            cursor = collection.aggregate(pipeline)
            results = await cursor.to_list(length=limit)

            return results

        except Exception as e:
            logger.error(f"Search failed, attempting fallback: {e}")
            return await self._fallback_search(query, category_id, subcategory_id, limit)

    async def _fallback_search(
        self,
        query: str,
        category_id: Optional[str] = None,
        subcategory_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Fallback search using regex when text index fails.
        Less efficient but ensures search still works.
        """
        try:
            logger.info("Using fallback regex search")

            # Mark index as invalid to trigger rebuild
            self._index_valid = False

            # Build filter
            filter_dict = {}

            if query:
                # Use case-insensitive regex search
                filter_dict["$or"] = [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"content.text": {"$regex": query, "$options": "i"}}
                ]

            if category_id:
                filter_dict["category_id"] = PydanticObjectId(category_id)

            if subcategory_id:
                filter_dict["subcategory_id"] = PydanticObjectId(subcategory_id)

            # Execute query
            articles = await Article.find(filter_dict).sort(
                [("updated_at", -1)]
            ).limit(limit).to_list()

            # Convert to dicts
            return [article.model_dump() for article in articles]

        except Exception as e:
            logger.error(f"Fallback search also failed: {e}")
            return []

    async def update_article_index(self, article_id: str) -> bool:
        """
        Update index for a specific article after modification.
        This helps prevent index corruption by ensuring consistency.
        """
        try:
            # For MongoDB text indexes, updates are automatic
            # But we validate the article exists and is indexed
            article = await Article.get(PydanticObjectId(article_id))
            if not article:
                logger.warning(f"Article {article_id} not found for index update")
                return False

            # Touch the article to ensure index is updated
            await article.save()
            logger.info(f"Index updated for article {article_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update index for article {article_id}: {e}")
            return False

    async def remove_from_index(self, article_id: str) -> bool:
        """
        Remove an article from the search index.
        Called after article deletion.
        """
        try:
            # MongoDB automatically removes from text index on delete
            # But we log for audit purposes
            logger.info(f"Article {article_id} removed from search index")
            return True

        except Exception as e:
            logger.error(f"Failed to remove article {article_id} from index: {e}")
            return False

    async def validate_index_integrity(self) -> Dict[str, Any]:
        """
        Validate search index integrity and report status.
        """
        try:
            collection = Article.get_motor_collection()

            # Get index information
            indexes = await collection.index_information()

            # Count articles
            total_articles = await Article.count()

            # Check if text index exists
            has_text_index = any(
                "text" in str(idx.get("key", {}))
                for idx in indexes.values()
            )

            return {
                "valid": self._index_valid and has_text_index,
                "total_articles": total_articles,
                "index_count": len(indexes),
                "has_text_index": has_text_index,
                "last_rebuild": self._last_rebuild_time.isoformat() if self._last_rebuild_time else None,
                "rebuild_in_progress": self._rebuild_in_progress
            }

        except Exception as e:
            logger.error(f"Failed to validate index integrity: {e}")
            return {
                "valid": False,
                "error": str(e)
            }

    def is_valid(self) -> bool:
        """Check if index is currently valid."""
        return self._index_valid


# Global search index manager instance
search_manager = SearchIndexManager()
