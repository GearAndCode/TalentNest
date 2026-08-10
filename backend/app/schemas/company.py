from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class CompanyCreate(BaseModel):
    company_name: str
    email: EmailStr
    password: str


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    headquarters: Optional[str] = None
    about: Optional[str] = None
    linkedin: Optional[str] = None
    phone: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    company_name: str
    email: EmailStr
    logo: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    headquarters: Optional[str] = None
    about: Optional[str] = None
    linkedin: Optional[str] = None
    phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True