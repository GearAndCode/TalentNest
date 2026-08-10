import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.config import GOOGLE_CLIENT_ID
from app.database import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import (
    CandidateLogin,
    CandidateRegister,
    CandidateResponse,
    ResetPasswordRequest,
    SendOTPRequest,
    VerifyOTPRequest,
)
from app.services.email_service import (
    generate_otp,
    send_otp_email,
    send_password_reset_email,
)

otp_store = {}
password_reset_store = {}

router = APIRouter(
    prefix="/candidate-auth",
    tags=["Candidate Authentication"],
)


@router.post("/register", response_model=CandidateResponse)
def register_candidate(
    candidate: CandidateRegister,
    db: Session = Depends(get_db),
):
    existing = db.query(Candidate).filter(
        Candidate.email == candidate.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_candidate = Candidate(
        full_name=candidate.full_name,
        email=candidate.email,
        phone=candidate.phone,
        hashed_password=hash_password(candidate.password),
        is_email_verified=True,
    )

    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return new_candidate


@router.post("/send-otp")
def send_otp(request: SendOTPRequest):
    otp = generate_otp()

    otp_store[request.email] = {
        "otp": otp,
        "expiry": datetime.now(timezone.utc) + timedelta(minutes=5),
    }

    if not send_otp_email(request.email, otp):
        raise HTTPException(status_code=500, detail="Failed to send OTP email.")

    return {"message": "OTP sent successfully."}


@router.post("/verify-otp")
def verify_otp(request: VerifyOTPRequest):
    if request.email not in otp_store:
        raise HTTPException(
            status_code=404,
            detail="OTP not found. Please request a new OTP.",
        )

    data = otp_store[request.email]

    if data["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    if datetime.now(timezone.utc) > data["expiry"]:
        del otp_store[request.email]
        raise HTTPException(status_code=400, detail="OTP expired.")

    del otp_store[request.email]

    return {
        "verified": True,
        "message": "Email verified successfully.",
    }


# ========================= FORGOT PASSWORD =========================

@router.post("/forgot-password")
def forgot_password(
    request: SendOTPRequest,
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(
        Candidate.email == request.email
    ).first()

    # Do not reveal whether an account exists.
    if not candidate:
        return {
            "message": (
                "If an account exists with this email, "
                "a password reset code has been sent."
            )
        }

    otp = generate_otp()

    password_reset_store[request.email] = {
        "otp": otp,
        "expiry": datetime.now(timezone.utc) + timedelta(minutes=5),
        "verified": False,
    }

    if not send_password_reset_email(request.email, otp):
        password_reset_store.pop(request.email, None)
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset email.",
        )

    return {
        "message": (
            "If an account exists with this email, "
            "a password reset code has been sent."
        )
    }


@router.post("/verify-reset-otp")
def verify_reset_otp(request: VerifyOTPRequest):
    data = password_reset_store.get(request.email)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="Reset code not found. Please request a new code.",
        )

    if datetime.now(timezone.utc) > data["expiry"]:
        password_reset_store.pop(request.email, None)
        raise HTTPException(
            status_code=400,
            detail="Reset code expired. Please request a new code.",
        )

    if data["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid reset code.")

    data["verified"] = True

    return {
        "verified": True,
        "message": "Reset code verified successfully.",
    }


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    data = password_reset_store.get(request.email)

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Password reset session not found. Please request a new code.",
        )

    if datetime.now(timezone.utc) > data["expiry"]:
        password_reset_store.pop(request.email, None)
        raise HTTPException(
            status_code=400,
            detail="Password reset session expired.",
        )

    if not data.get("verified"):
        raise HTTPException(
            status_code=403,
            detail="Please verify the reset code first.",
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    candidate = db.query(Candidate).filter(
        Candidate.email == request.email
    ).first()

    if not candidate:
        password_reset_store.pop(request.email, None)
        raise HTTPException(
            status_code=404,
            detail="Candidate account not found.",
        )

    candidate.hashed_password = hash_password(request.new_password)
    db.commit()

    password_reset_store.pop(request.email, None)

    return {
        "message": "Password reset successfully. You can now sign in."
    }


# ========================= NORMAL LOGIN =========================

@router.post("/login")
def login_candidate(
    request: CandidateLogin,
    db: Session = Depends(get_db),
):
    candidate = db.query(Candidate).filter(
        Candidate.email == request.email
    ).first()

    if not candidate:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(request.password, candidate.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not candidate.is_email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email first.",
        )

    token = create_access_token(
        data={
            "candidate_id": candidate.id,
            "email": candidate.email,
            "role": "candidate",
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "candidate": {
            "id": candidate.id,
            "name": candidate.full_name,
            "email": candidate.email,
        },
    }


# ========================= GOOGLE LOGIN =========================

@router.post("/google")
def google_login(
    request: dict,
    db: Session = Depends(get_db),
):
    credential = request.get("credential")

    if not credential:
        raise HTTPException(
            status_code=400,
            detail="Google credential is required.",
        )

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google Sign-In is not configured on the backend.",
        )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        google_user = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        print(f"GOOGLE CANDIDATE LOGIN ERROR: {exc}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Google credential.",
        )

    email = google_user.get("email")
    google_name = google_user.get("name") or google_user.get("given_name")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google account did not provide an email address.",
        )

    if google_user.get("email_verified") is not True:
        raise HTTPException(
            status_code=403,
            detail="Your Google email is not verified.",
        )

    candidate = db.query(Candidate).filter(
        Candidate.email == email
    ).first()

    if candidate is None:
        random_password = secrets.token_urlsafe(48)

        candidate = Candidate(
            full_name=google_name or email.split("@")[0],
            email=email,
            phone=None,
            hashed_password=hash_password(random_password),
            is_email_verified=True,
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

    elif not candidate.is_email_verified:
        candidate.is_email_verified = True
        db.commit()
        db.refresh(candidate)

    token = create_access_token(
        data={
            "candidate_id": candidate.id,
            "email": candidate.email,
            "role": "candidate",
            "auth_provider": "google",
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "candidate": {
            "id": candidate.id,
            "name": candidate.full_name,
            "email": candidate.email,
        },
    }
