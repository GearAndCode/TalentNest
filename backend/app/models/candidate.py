from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    phone = Column(String(30))

    # Authentication
    hashed_password = Column(String(255), nullable=False)

    is_email_verified = Column(Boolean, default=False)

    verification_code = Column(String(10), nullable=True)

    verification_expiry = Column(DateTime(timezone=True), nullable=True)

    # Resume
    resume_path = Column(String(300))

    # ---------- AI Resume Data ----------

    parsed_name = Column(String(150))

    parsed_email = Column(String(150))

    parsed_phone = Column(String(30))

    parsed_skills = Column(Text)

    resume_text = Column(Text)

    embedding = Column(Text)

    # ------------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    applications = relationship(
        "Application",
        back_populates="candidate",
        cascade="all, delete"
    )