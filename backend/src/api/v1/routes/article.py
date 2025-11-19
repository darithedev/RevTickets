from fastapi import APIRouter, HTTPException, Depends, Query
from src.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse
from beanie import PydanticObjectId
from src.services.article_service import ArticleService
from src.services.search import search_manager
from typing import List, Optional
from src.utils.security import get_current_agent_user, get_current_user

router = APIRouter(prefix="/articles", tags=["Articles"])

# Agent-only routes (create, update, delete)
@router.post("/", response_model=ArticleResponse, dependencies=[Depends(get_current_agent_user)])
async def create_article(data: ArticleCreate):
    try:
        result = await ArticleService.create_article(data)
        # Update search index after creation
        await search_manager.update_article_index(result.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{article_id}", response_model=ArticleResponse, dependencies=[Depends(get_current_agent_user)])
async def update_article(article_id: str, data: ArticleUpdate):
    try:
        result = await ArticleService.update_article(article_id, data)
        # Update search index after update
        await search_manager.update_article_index(article_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{article_id}", dependencies=[Depends(get_current_agent_user)])
async def delete_article(article_id: str):
    await ArticleService.delete_article(article_id)
    # Remove from search index
    await search_manager.remove_from_index(article_id)
    return {"message": "Article deleted"}

# Public routes (all authenticated users can browse)
@router.get("/", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def get_all_articles():
    return await ArticleService.get_all_articles()

@router.get("/{article_id}", response_model=ArticleResponse, dependencies=[Depends(get_current_user)])
async def get_article(article_id: str):
    try:
        return await ArticleService.get_article(article_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/category/{category_id}", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def get_articles_by_category(category_id: str):
    return await ArticleService.get_articles_by_category(category_id)

@router.get("/subcategory/{subcategory_id}", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def get_articles_by_subcategory(subcategory_id: str):
    return await ArticleService.get_articles_by_subcategory(subcategory_id)

# Search endpoints
@router.get("/search/", response_model=List[ArticleResponse], dependencies=[Depends(get_current_user)])
async def search_articles(
    q: str = Query(..., min_length=1, description="Search query"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    subcategory_id: Optional[str] = Query(None, description="Filter by subcategory"),
    limit: int = Query(50, ge=1, le=100, description="Max results to return")
):
    """Search articles with full-text search and optional filters."""
    try:
        results = await search_manager.search_articles(
            query=q,
            category_id=category_id,
            subcategory_id=subcategory_id,
            limit=limit
        )
        # Convert results to ArticleResponse format
        return [await ArticleService.get_article(str(r["_id"])) for r in results if "_id" in r]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/search/rebuild-index", dependencies=[Depends(get_current_agent_user)])
async def rebuild_search_index(force: bool = Query(False)):
    """Rebuild search indexes. Admin operation."""
    try:
        success = await search_manager.rebuild_indexes(force=force)
        if success:
            return {"message": "Search indexes rebuilt successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to rebuild indexes")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rebuild indexes: {str(e)}")

@router.get("/search/status", dependencies=[Depends(get_current_agent_user)])
async def get_search_index_status():
    """Get search index status and health information."""
    return await search_manager.validate_index_integrity()
