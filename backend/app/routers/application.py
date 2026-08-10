from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.candidate import Candidate
from app.schemas.ranking import RankedCandidate
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.semantic_matcher import calculate_semantic_match
from app.services.ollama_service import analyze_candidate
from app.auth.oauth2 import get_current_identity, get_current_candidate, get_current_company

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationResponse)
def apply_for_job(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    candidate=Depends(get_current_candidate),
):
    # Never trust candidate_id from the browser.
    candidate_id = candidate.id

    job = db.query(Job).filter(Job.id == application.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if not candidate.resume_text:
        raise HTTPException(status_code=400, detail="Please upload your resume before applying.")

    existing = db.query(Application).filter(
        Application.candidate_id == candidate_id,
        Application.job_id == application.job_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied.")

    if not candidate.embedding:
        raise HTTPException(status_code=400, detail="Candidate embedding not found. Upload the resume again.")
    if not job.embedding:
        raise HTTPException(status_code=400, detail="Job embedding not found. Recreate or update the job.")

    ai_result = calculate_semantic_match(
        json.loads(candidate.embedding),
        json.loads(job.embedding),
    )
    analysis = analyze_candidate(candidate.resume_text, job.description)

    new_application = Application(
        candidate_id=candidate_id,
        job_id=job.id,
        status="Applied",
        match_score=ai_result["score"],
        matched_skills=", ".join(analysis.get("matched_skills", [])),
        missing_skills=", ".join(analysis.get("missing_skills", [])),
        ai_recommendation=analysis.get("recommendation", ""),
        ai_summary=analysis.get("overall_summary", ""),
        interview_questions=analysis.get("interview_questions", []),
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application


@router.get("/", response_model=list[ApplicationResponse])
def get_applications(
    identity=Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    if identity["type"] == "candidate":
        return db.query(Application).filter(
            Application.candidate_id == identity["candidate_id"]
        ).all()

    company_id = identity["company_id"]
    return (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == company_id)
        .all()
    )


@router.get("/jobs/{job_id}/ranked-candidates", response_model=list[RankedCandidate])
def ranked_candidates(
    job_id: int,
    db: Session = Depends(get_db),
    company=Depends(get_current_company),
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == company.id,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found for your company.")

    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .order_by(Application.match_score.desc())
        .all()
    )

    return [
        RankedCandidate(
            candidate_id=app.candidate.id,
            candidate_name=app.candidate.full_name,
            match_score=app.match_score or 0,
            recommendation=app.ai_recommendation or "No recommendation available",
        )
        for app in applications
    ]


@router.get("/match-distribution")
def match_distribution(
    db: Session = Depends(get_db),
    company=Depends(get_current_company),
):
    applications = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == company.id)
        .all()
    )
    return [
        {"candidate": app.candidate.full_name, "score": app.match_score}
        for app in applications
    ]


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    identity=Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    if identity["type"] == "candidate":
        allowed = application.candidate_id == identity["candidate_id"]
    else:
        allowed = application.job.company_id == identity["company_id"]

    if not allowed:
        raise HTTPException(status_code=404, detail="Application not found.")

    return application


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    updated: ApplicationUpdate,
    db: Session = Depends(get_db),
    company=Depends(get_current_company),
):
    application = (
        db.query(Application)
        .join(Job, Application.job_id == Job.id)
        .filter(
            Application.id == application_id,
            Job.company_id == company.id,
        )
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found for your company.")

    application.status = updated.status
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    identity=Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    if identity["type"] == "candidate":
        allowed = application.candidate_id == identity["candidate_id"]
    else:
        allowed = application.job.company_id == identity["company_id"]

    if not allowed:
        raise HTTPException(status_code=404, detail="Application not found.")

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}
