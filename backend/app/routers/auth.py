from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyResponse
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ---------------- REGISTER ----------------

@router.post(
    "/register",
    response_model=CompanyResponse
)
def register_company(
    company: CompanyCreate,
    db: Session = Depends(get_db)
):
    existing_company = db.query(Company).filter(
        Company.email == company.email
    ).first()

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    new_company = Company(
        company_name=company.company_name,
        email=company.email,
        hashed_password=hash_password(company.password)
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


# ---------------- LOGIN ----------------

@router.post("/login")
def login(
    request: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(
        Company.email == request.username
    ).first()

    if not company:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        request.password,
        company.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "company_id": company.id,
            "email": company.email,
            "role": "company"
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }