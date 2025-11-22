from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import List, Optional, Dict
from datetime import datetime, timezone
from beanie import PydanticObjectId
from src.models.rich_text import RichTextContent
from src.schemas.category import CategoryResponse
from src.schemas.subcategory import SubCategoryResponse

class TagBase(BaseModel):
    key: str
    value: str

class ArticleCreate(BaseModel):
    title: str
    content: RichTextContent
    category_id: str  # Will be converted to PydanticObjectId in service
    subcategory_id: str  # Will be converted to PydanticObjectId in service
    tags: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    vector_ids: Optional[List[str]] = Field(default_factory=list)

class ArticleResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    content: RichTextContent
    category: CategoryResponse
    subcategory: SubCategoryResponse = Field(..., alias="subCategory")
    tags: List[TagBase] = Field(default_factory=list)
    vector_ids: List[str] = Field(default_factory=list, alias="vectorIds")
    
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    
    @field_serializer('created_at', 'updated_at', when_used='always')
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        """Serialize datetime to ISO format with timezone (Z suffix for UTC)"""
        if dt is None:
            return None
        # Ensure the datetime is timezone-aware (assume UTC if naive)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        # Return ISO format string with 'Z' suffix for UTC
        return dt.isoformat().replace('+00:00', 'Z')

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[RichTextContent] = None
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    tags: Optional[List[Dict[str, str]]] = None
    vector_ids: Optional[List[str]] = None
