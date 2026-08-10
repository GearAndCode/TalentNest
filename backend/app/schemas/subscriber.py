from pydantic import BaseModel, EmailStr
from datetime import datetime


class SubscriberCreate(BaseModel):
    email: EmailStr


class SubscriberResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True