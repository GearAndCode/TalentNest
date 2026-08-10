from pydantic import BaseModel


class RankedCandidate(BaseModel):
    candidate_id: int
    candidate_name: str
    match_score: int
    recommendation: str

    class Config:
        from_attributes = True