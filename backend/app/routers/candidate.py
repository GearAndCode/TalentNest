from fastapi import Query, APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
import json

from app.database import get_db
from app.models.candidate import Candidate
from app.models.application import Application
from app.models.job import Job
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.services.resume_parser import parse_resume
from app.services.embedding_service import get_embedding
from app.auth.oauth2 import get_current_identity, get_current_candidate, get_current_company

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("/", response_model=CandidateResponse)
def create_candidate(candidate: CandidateCreate, db: Session = Depends(get_db)):
    existing = db.query(Candidate).filter(Candidate.email == candidate.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Candidate already exists.")

    # This endpoint is retained for compatibility. Normal registration uses /candidate-auth/register.
    new_candidate = Candidate(
        full_name=candidate.full_name,
        email=candidate.email,
        phone=candidate.phone,
        hashed_password="",
        is_email_verified=False,
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate


def _company_candidate_query(db: Session, company_id: int):
    return (
        db.query(Candidate)
        .join(Application, Application.candidate_id == Candidate.id)
        .join(Job, Application.job_id == Job.id)
        .filter(Job.company_id == company_id)
        .distinct()
    )


@router.get("/search")
def search_candidates(
    keyword: str = Query(...),
    identity=Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    if identity["type"] == "candidate":
        query = db.query(Candidate).filter(
            Candidate.id == identity["candidate_id"]
        )
    else:
        query = _company_candidate_query(db, identity["company_id"])

    return query.filter(
        Candidate.full_name.ilike(f"%{keyword}%")
    ).all()


@router.get("/", response_model=list[CandidateResponse])
def get_candidates(
    identity=Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    if identity["type"] == "candidate":
        return db.query(Candidate).filter(
            Candidate.id == identity["candidate_id"]
        ).all()

    return _company_candidate_query(db, identity["company_id"]).all()


@router.get("/me", response_model=CandidateResponse)
def get_my_candidate(
    candidate=Depends(get_current_candidate),
):
    return candidate


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(
    candidate_id: int,
    identity=Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    if identity["type"] == "candidate":
        if candidate.id != identity["candidate_id"]:
            raise HTTPException(status_code=404, detail="Candidate not found.")
    else:
        allowed = (
            db.query(Application.id)
            .join(Job, Application.job_id == Job.id)
            .filter(
                Application.candidate_id == candidate_id,
                Job.company_id == identity["company_id"],
            )
            .first()
        )
        if not allowed:
            raise HTTPException(status_code=404, detail="Candidate not found.")

    return candidate


@router.post("/{candidate_id}/upload-resume")
def upload_resume(
    candidate_id: int,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    candidate=Depends(get_current_candidate),
):
    # URL candidate_id is checked against the authenticated candidate.
    if candidate_id != candidate.id:
        raise HTTPException(status_code=403, detail="You can only upload your own resume.")

    upload_dir = "uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{candidate.id}_{resume.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    resume_data = parse_resume(file_path)

    candidate.resume_path = file_path
    candidate.parsed_name = resume_data.get("name")
    candidate.parsed_email = resume_data.get("email")
    candidate.parsed_phone = resume_data.get("phone")
    candidate.parsed_skills = ",".join(resume_data.get("skills", []))
    candidate.resume_text = resume_data.get("raw_text", "")
    candidate.embedding = json.dumps(get_embedding(candidate.resume_text))

    db.commit()
    db.refresh(candidate)

    return {
        "message": "Resume uploaded successfully",
        "resume_path": file_path,
        "parsed_data": resume_data,
    }
