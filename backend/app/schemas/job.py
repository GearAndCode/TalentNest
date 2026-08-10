from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class JobCreate(BaseModel):
    title: str
    department: str
    category: Optional[str] = "Engineering"
    location: str
    description: str
    salary: float
    employment_type: Optional[str] = "Full Time"
    experience: Optional[str] = "Entry Level"
    skills: Optional[List[str]] = []


class JobResponse(BaseModel):
    id: int
    title: str
    department: str
    category: Optional[str] = None
    location: str
    description: str
    salary: float

    company_id: int
    company_name: str
    company_logo: Optional[str] = None
    company_headquarters: Optional[str] = None

    employment_type: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
