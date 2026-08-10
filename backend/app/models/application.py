from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Text
)
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id")
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id")
    )

    status = Column(
        String(50),
        default="Applied"
    )

    applied_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # ---------------- AI Matching ----------------

    match_score = Column(Integer)

    matched_skills = Column(Text)

    missing_skills = Column(Text)

    ai_recommendation = Column(Text)

    # ---------------- AI Recruiter Analysis ----------------

    ai_summary = Column(Text)

    interview_questions = Column(JSON)

    # -------------------------------------------------------

    candidate = relationship(
        "Candidate",
        back_populates="applications"
    )

    job = relationship(
        "Job",
        back_populates="applications"
    )