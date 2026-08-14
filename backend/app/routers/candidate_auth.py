import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.config import GOOGLE_CLIENT_ID
from app.database import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateLogin, CandidateRegister, CandidateResponse, SendOTPRequest, VerifyOTPRequest
from app.services.email_service import generate_otp, send_otp_email

router = APIRouter(prefix="/candidate-auth", tags=["Candidate Authentication"])

# Email verification happens before the candidate row exists, so OTP state is
# intentionally separate from the Candidate table. It is short-lived (5 min).
otp_store: dict[str, dict] = {}
verified_emails: dict[str, datetime] = {}


def _email_key(email: str) -> str:
    return email.strip().lower()


@router.post("/send-otp")
def send_otp(request: SendOTPRequest):
    email = _email_key(str(request.email))
    otp = generate_otp()
    otp_store[email] = {
        "otp": otp,
        "expiry": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    if not send_otp_email(email, otp):
        otp_store.pop(email, None)
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Please try again.")
    return {"message": "OTP sent successfully."}


@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    email = _email_key(str(request.email))
    data = otp_store.get(email)
    if not data:
        raise HTTPException(status_code=404, detail="OTP not found. Please request a new OTP.")
    if data["otp"] != request.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    now = datetime.now(timezone.utc)
    if now > data["expiry"]:
        otp_store.pop(email, None)
        raise HTTPException(status_code=400, detail="OTP expired.")
    otp_store.pop(email, None)
    verified_emails[email] = now + timedelta(minutes=10)
    return {"verified": True, "message": "Email verified successfully."}


@router.post("/register", response_model=CandidateResponse)
def register_candidate(candidate: CandidateRegister, db: Session = Depends(get_db)):
    email = _email_key(str(candidate.email))
    verified_until = verified_emails.get(email)
    if not verified_until or datetime.now(timezone.utc) > verified_until:
        verified_emails.pop(email, None)
        raise HTTPException(status_code=403, detail="Please verify your email before creating your account.")

    existing = db.query(Candidate).filter(Candidate.email == email).first()
    if existing:
        if existing.is_email_verified:
            raise HTTPException(status_code=400, detail="Email already registered.")
        # Recover an abandoned/unverified registration cleanly.
        existing.full_name = candidate.full_name.strip()
        existing.phone = candidate.phone.strip()
        existing.hashed_password = hash_password(candidate.password)
        existing.is_email_verified = True
        db.commit()
        db.refresh(existing)
        verified_emails.pop(email, None)
        return existing

    new_candidate = Candidate(
        full_name=candidate.full_name.strip(),
        email=email,
        phone=candidate.phone.strip(),
        hashed_password=hash_password(candidate.password),
        is_email_verified=True,
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    verified_emails.pop(email, None)
    return new_candidate


@router.post("/login")
def login_candidate(request: CandidateLogin, db: Session = Depends(get_db)):
    email = _email_key(str(request.email))
    candidate = db.query(Candidate).filter(Candidate.email == email).first()
    if not candidate or not verify_password(request.password, candidate.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not candidate.is_email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first.")
    token = create_access_token(data={
        "candidate_id": candidate.id,
        "email": candidate.email,
        "role": "candidate",
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "candidate": {"id": candidate.id, "name": candidate.full_name, "email": candidate.email},
    }


@router.post("/google")
def google_login(request: dict, db: Session = Depends(get_db)):
    credential = request.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Google credential is required.")
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Sign-In is not configured on the backend.")

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        google_user = id_token.verify_oauth2_token(
            credential, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except Exception as exc:
        print(f"GOOGLE CANDIDATE LOGIN ERROR: {exc}")
        raise HTTPException(status_code=401, detail="Invalid or expired Google credential.")

    email = _email_key(google_user.get("email", ""))
    if not email:
        raise HTTPException(status_code=400, detail="Google account did not provide an email address.")
    if google_user.get("email_verified") is not True:
        raise HTTPException(status_code=403, detail="Your Google email is not verified.")

    name = google_user.get("name") or google_user.get("given_name") or email.split("@")[0]
    candidate = db.query(Candidate).filter(Candidate.email == email).first()
    if candidate is None:
        candidate = Candidate(
            full_name=name, email=email, phone="",
            hashed_password=hash_password(secrets.token_urlsafe(48)),
            is_email_verified=True,
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
    elif not candidate.is_email_verified:
        candidate.is_email_verified = True
        db.commit()
        db.refresh(candidate)

    token = create_access_token(data={
        "candidate_id": candidate.id,
        "email": candidate.email,
        "role": "candidate",
        "auth_provider": "google",
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "candidate": {"id": candidate.id, "name": candidate.full_name, "email": candidate.email},
    }