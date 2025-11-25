from pydantic import BaseModel, EmailStr, ConfigDict, field_serializer
from typing import Optional, List
from datetime import datetime, timezone

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class AgentSkills(BaseModel):
    category: Optional['CategoryResponse'] = None
    subcategories: Optional[List['SubCategoryResponse']] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    role: str
    agent_skills: Optional[AgentSkills] = None
    created_at: datetime
    
    @field_serializer('created_at', when_used='always')
    def serialize_datetime(self, dt: Optional[datetime]) -> Optional[str]:
        """Serialize datetime to ISO format with timezone (Z suffix for UTC)"""
        if dt is None:
            return None
        # Ensure the datetime is timezone-aware (assume UTC if naive)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        # Return ISO format string with 'Z' suffix for UTC
        return dt.isoformat().replace('+00:00', 'Z')

# Forward references for circular imports
from .category import CategoryResponse
from .subcategory import SubCategoryResponse

AgentSkills.model_rebuild()
UserResponse.model_rebuild()

class UserLogin(BaseModel):
    email: EmailStr
    password: str