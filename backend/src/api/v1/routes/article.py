from fastapi import APIRouter, HTTPException, Depends
from src.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse
from beanie import PydanticObjectId
from src.services.article_service import ArticleService
from src.services.ai_service import AIService
from typing import List
from src.utils.security import get_current_agent_user, get_current_user
from pydantic import BaseModel

class GenerateTagsRequest(BaseModel):
    title: str
    content: str
    category: str = None
    subcategory: str = None

class GenerateTagsResponse(BaseModel):
    tags: List[str]

router = APIRouter(prefix="/articles", tags=["Articles"])

# Agent-only routes (create, update, delete)
@router.post("/", response_model=ArticleResponse, dependencies=[Depends(get_current_agent_user)])
async def create_article(data: ArticleCreate):
    try:
        return await ArticleService.create_article(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{article_id}", response_model=ArticleResponse, dependencies=[Depends(get_current_agent_user)])
async def update_article(article_id: str, data: ArticleUpdate):
    try:
        return await ArticleService.update_article(article_id, data)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{article_id}", dependencies=[Depends(get_current_agent_user)])
async def delete_article(article_id: str):
    await ArticleService.delete_article(article_id)
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

# AI-powered tag generation endpoints
@router.post("/generate-tags", response_model=GenerateTagsResponse, dependencies=[Depends(get_current_agent_user)])
async def generate_tags_from_content(data: GenerateTagsRequest):
    """Generate AI-powered tags from article content (without saving)."""
    try:
        tags = await AIService.generate_tags_from_content(
            title=data.title,
            content=data.content,
            category=data.category,
            subcategory=data.subcategory
        )
        return GenerateTagsResponse(tags=tags)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{article_id}/generate-tags", response_model=GenerateTagsResponse, dependencies=[Depends(get_current_agent_user)])
async def generate_article_tags(article_id: str):
    """Generate and save AI-powered tags for an existing article."""
    try:
        tags = await AIService.generate_article_tags(article_id)
        return GenerateTagsResponse(tags=tags)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
