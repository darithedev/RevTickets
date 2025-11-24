from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional, List, Dict
from datetime import datetime, timezone
from src.models.enums import TicketStatus, TicketPriority
from src.schemas.category import CategoryResponse
from src.schemas.subcategory import SubCategoryResponse
from src.models.rich_text import RichTextContent
from beanie import PydanticObjectId

class TagData(BaseModel):
    key: str
    value: Optional[str] = None

class UserInfo(BaseModel):
    id: PydanticObjectId
    email: str
    name: Optional[str] = None

class TicketBase(BaseModel):
    category_id: PydanticObjectId = Field(..., alias="categoryId")
    sub_category_id: PydanticObjectId = Field(..., alias="subCategoryId") 
    user_id: str = Field(..., alias="userId")
    agent_id: Optional[str] = Field(None, alias="agentId")
    title: str
    description: str
    content: RichTextContent
    status: TicketStatus
    priority: TicketPriority

class TicketCreate(BaseModel):
    category_id: str  # Will be converted to PydanticObjectId in service
    sub_category_id: str  # Will be converted to PydanticObjectId in service
    title: str
    description: str
    content: RichTextContent
    priority: TicketPriority = TicketPriority.medium
    tag_ids: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class TicketUpdate(TicketBase):
    tagIds: Optional[List[str]]

class ReopenEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    reopened_at: datetime = Field(alias="reopenedAt")
    previous_status: str = Field(alias="previousStatus")
    
    @field_serializer('reopened_at', when_used='always')
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        """Serialize datetime to ISO format with timezone (Z suffix for UTC)"""
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat().replace('+00:00', 'Z')

class TicketResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    description: str
    content: RichTextContent
    category: CategoryResponse
    sub_category: SubCategoryResponse = Field(..., alias="subCategory")
    user_info: UserInfo = Field(..., alias="userInfo")  # or UserResponse
    agent_info: Optional[UserInfo] = Field(None, alias="agentInfo")  # or Optional[UserResponse]
    tag_ids: Optional[List[TagData]] = Field(default_factory=list, alias="tagIds")
    status: TicketStatus
    priority: TicketPriority

    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    closed_at: Optional[datetime] = Field(None, alias="closedAt")
    reopen_history: Optional[List[ReopenEvent]] = Field(default_factory=list, alias="reopenHistory")
    
    @field_serializer('created_at', 'updated_at', 'closed_at', when_used='always')
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        """Serialize datetime to ISO format with timezone (Z suffix for UTC)"""
        if dt is None:
            return None
        # Ensure the datetime is timezone-aware (assume UTC if naive)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        # Return ISO format string with 'Z' suffix for UTC
        return dt.isoformat().replace('+00:00', 'Z')
