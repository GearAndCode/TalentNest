from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    candidate_id: int
    job_id: int


class ApplicationUpdate(BaseModel):
    status: str


class ApplicationResponse(BaseModel):
    id: int

    candidate_id: int

    job_id: int

    status: str

    match_score: int

    matched_skills: str | None = None

    missing_skills: str | None = None

    ai_recommendation: str | None = None

    ai_summary: str | None = None

    interview_questions: list[str] | None = None

    class Config:
        from_attributes = True