from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String(150), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    hashed_password = Column(String(255), nullable=False)

    logo = Column(String(255), nullable=True)

    website = Column(String(255), nullable=True)

    industry = Column(String(150), nullable=True)

    company_size = Column(String(50), nullable=True)

    headquarters = Column(String(150), nullable=True)

    about = Column(Text, nullable=True)

    linkedin = Column(String(255), nullable=True)

    phone = Column(String(30), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    jobs = relationship(
        "Job",
        back_populates="company",
        cascade="all, delete-orphan"
    )