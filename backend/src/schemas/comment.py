from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import List, Optional
from datetime import datetime, timezone
from beanie import PydanticObjectId
from src.models.rich_text import RichTextContent

class UserInfo(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    role: str  # "user" or "agent" to clearly show user type
class CommentBase(BaseModel):
    content: RichTextContent
    user_id: PydanticObjectId = Field(..., alias="userId")  # ID of the user who made the comment
    ticket_id: PydanticObjectId = Field(..., alias="ticketId")  # ID of the ticket the comment is associated with
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

class CommentCreate(BaseModel):
    content: RichTextContent
    # For create, we don't need all the base fields since they'll be set by the service
    
    class Config:
        populate_by_name = True    

class CommentResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str  # ID of the comment
    content: RichTextContent
    ticket_id: str = Field(..., alias="ticketId")  # ID of the associated ticket
    user: UserInfo  # User information
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    
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

# feature comment edit
class CommentUpdate(BaseModel):
    content: Optional[RichTextContent] = None

    class Config:
        populate_by_name = True