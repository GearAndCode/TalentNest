from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer,
        ForeignKey("companies.id"),
        nullable=False
    )

    title = Column(String(150), nullable=False)

    department = Column(String(100))

    category = Column(String(100))

    location = Column(String(100))

    description = Column(Text)

    salary = Column(Integer)

    employment_type = Column(String(50))

    experience = Column(String(100))

    skills = Column(Text)

    embedding = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    company = relationship(
        "Company",
        back_populates="jobs"
    )

    applications = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete"
    )