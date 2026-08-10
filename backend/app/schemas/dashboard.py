from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_candidates: int
    total_jobs: int
    total_applications: int
    average_match_score: float

    class Config:
        from_attributes = True