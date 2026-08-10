from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.company import Company
from app.models.job import Job
from app.models.candidate import Candidate
from app.models.application import Application
from app.auth.oauth2 import get_current_company

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    company=Depends(get_current_company),
    db: Session = Depends(get_db),
):
    company_jobs = db.query(Job).filter(Job.company_id == company.id)

    total_jobs = company_jobs.count()

    company_applications = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == company.id)
    )

    total_applications = company_applications.count()

    total_candidates = (
        db.query(Candidate)
        .join(Application, Application.candidate_id == Candidate.id)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == company.id)
        .distinct()
        .count()
    )

    average_match_score = company_applications.with_entities(
        func.avg(Application.match_score)
    ).scalar()

    highest_match_score = company_applications.with_entities(
        func.max(Application.match_score)
    ).scalar()

    lowest_match_score = company_applications.with_entities(
        func.min(Application.match_score)
    ).scalar()

    recommended_for_interview = company_applications.filter(
        Application.ai_recommendation.ilike("%recommend%")
    ).count()

    return {
        "company_id": company.id,
        "company_name": company.company_name,
        "jobs": total_jobs,
        "candidates": total_candidates,
        "applications": total_applications,
        "average_match_score": round(average_match_score or 0, 2),
        "highest_match_score": highest_match_score or 0,
        "lowest_match_score": lowest_match_score or 0,
        "recommended_for_interview": recommended_for_interview,
    }
