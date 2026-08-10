import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi.security import OAuth2PasswordBearer

from app.database import get_db
from app.models.job import Job
from app.models.company import Company
from app.models.subscriber import Subscriber
from app.schemas.job import JobCreate, JobResponse
from app.services.embedding_service import get_embedding
from app.services.email_service import send_new_job_alerts
from app.auth.oauth2 import get_current_company

router = APIRouter(prefix="/jobs", tags=["Jobs"])

optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False,
)


def _parse_job_skills(job: Job) -> Job:
    if isinstance(job.skills, str):
        try:
            job.skills = json.loads(job.skills)
        except Exception:
            job.skills = []
    elif job.skills is None:
        job.skills = []
    return job


def _job_response(job: Job) -> dict:
    """Build a job payload using the real Job -> Company relationship."""
    _parse_job_skills(job)
    company = job.company

    return {
        "id": job.id,
        "title": job.title,
        "department": job.department,
        "category": job.category,
        "location": job.location,
        "description": job.description,
        "salary": job.salary,
        "company_id": job.company_id,
        "company_name": company.company_name if company else "Unknown Company",
        "company_logo": company.logo if company else None,
        "company_headquarters": company.headquarters if company else None,
        "employment_type": job.employment_type,
        "experience": job.experience,
        "skills": job.skills,
        "created_at": job.created_at,
    }


def _company_scope_query(query, token: Optional[str], db: Session):
    """Public/candidate requests see all jobs; company JWTs are tenant-scoped."""
    if not token:
        return query

    try:
        from app.auth.oauth2 import _decode_token

        payload = _decode_token(token)
        company_id = payload.get("company_id")

        if company_id is None:
            return query

        company_id = int(company_id)

        if not db.query(Company).filter(Company.id == company_id).first():
            raise HTTPException(
                status_code=401,
                detail="Company account not found.",
            )

        return query.filter(Job.company_id == company_id)

    except HTTPException:
        raise
    except Exception:
        return query


@router.post("/create", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    company=Depends(get_current_company),
):
    embedding = get_embedding(job.description)

    new_job = Job(
        company_id=company.id,
        title=job.title,
        department=job.department,
        category=job.category,
        location=job.location,
        description=job.description,
        salary=job.salary,
        employment_type=job.employment_type,
        experience=job.experience,
        skills=json.dumps(job.skills) if job.skills else "[]",
        embedding=json.dumps(embedding),
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Reload with the actual company relationship.
    new_job = (
        db.query(Job)
        .options(joinedload(Job.company))
        .filter(Job.id == new_job.id)
        .first()
    )

    # Send alerts only after the job has been successfully committed.
    # Email errors are isolated so they cannot break job creation.
    try:
        subscribers = db.query(Subscriber).all()

        print("\n========================================")
        print("       TALENTNEST JOB ALERT")
        print("========================================")
        print(f"Job: {new_job.title}")
        print(
            f"Company: "
            f"{new_job.company.company_name if new_job.company else 'Unknown Company'}"
        )
        print(f"Subscribers found: {len(subscribers)}")

        sent_count = send_new_job_alerts(
            subscribers,
            new_job,
            new_job.company,
        )

        print(f"Emails successfully sent: {sent_count}")
        print("========================================\n")

    except Exception as exc:
        print("\n========================================")
        print("JOB CREATED - EMAIL ALERT ERROR")
        print(f"Error: {exc}")
        print("========================================\n")

    return _job_response(new_job)


@router.get("/", response_model=list[JobResponse])
def get_jobs(
    token: Optional[str] = Depends(optional_oauth2),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Job)
        .options(joinedload(Job.company))
        .join(Company, Job.company_id == Company.id)
    )
    query = _company_scope_query(query, token, db)

    jobs = query.order_by(Job.created_at.desc()).all()
    return [_job_response(job) for job in jobs]


@router.get("/search", response_model=list[JobResponse])
def search_jobs(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    token: Optional[str] = Depends(optional_oauth2),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Job)
        .options(joinedload(Job.company))
        .join(Company, Job.company_id == Company.id)
    )
    query = _company_scope_query(query, token, db)

    if keyword and keyword.strip():
        value = keyword.strip()
        query = query.filter(
            or_(
                Job.title.ilike(f"%{value}%"),
                Job.description.ilike(f"%{value}%"),
                Job.category.ilike(f"%{value}%"),
                Job.skills.ilike(f"%{value}%"),
            )
        )

    if location and location.strip():
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if department and department.strip():
        query = query.filter(Job.department.ilike(f"%{department.strip()}%"))

    jobs = query.order_by(Job.created_at.desc()).all()
    return [_job_response(job) for job in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    token: Optional[str] = Depends(optional_oauth2),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Job)
        .options(joinedload(Job.company))
        .join(Company, Job.company_id == Company.id)
        .filter(Job.id == job_id)
    )
    query = _company_scope_query(query, token, db)

    job = query.first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    return _job_response(job)


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    updated_job: JobCreate,
    db: Session = Depends(get_db),
    company=Depends(get_current_company),
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == company.id,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found for your company.",
        )

    job.title = updated_job.title
    job.department = updated_job.department
    job.category = updated_job.category
    job.location = updated_job.location
    job.description = updated_job.description
    job.salary = updated_job.salary
    job.employment_type = updated_job.employment_type
    job.experience = updated_job.experience
    job.skills = json.dumps(updated_job.skills) if updated_job.skills else "[]"
    job.embedding = json.dumps(get_embedding(updated_job.description))

    db.commit()
    db.refresh(job)

    job = (
        db.query(Job)
        .options(joinedload(Job.company))
        .filter(Job.id == job.id)
        .first()
    )

    return _job_response(job)


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    company=Depends(get_current_company),
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == company.id,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found for your company.",
        )

    db.delete(job)
    db.commit()

    return {"message": "Job deleted successfully"}
