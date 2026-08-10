from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM
from app.database import get_db
from app.models.company import Company
from app.models.candidate import Candidate

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _decode_token(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise credentials_exception

    if not payload.get("company_id") and not payload.get("candidate_id"):
        raise credentials_exception

    return payload


def get_current_identity(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = _decode_token(token)

    if payload.get("company_id") is not None:
        company = db.query(Company).filter(
            Company.id == int(payload["company_id"])
        ).first()
        if company is None:
            raise HTTPException(status_code=401, detail="Company account not found.")
        return {"type": "company", "user": company, "company_id": company.id}

    candidate = db.query(Candidate).filter(
        Candidate.id == int(payload["candidate_id"])
    ).first()
    if candidate is None:
        raise HTTPException(status_code=401, detail="Candidate account not found.")

    return {
        "type": "candidate",
        "user": candidate,
        "candidate_id": candidate.id,
    }


def get_current_company(
    identity=Depends(get_current_identity),
):
    if identity["type"] != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company authentication required.",
        )
    return identity["user"]


def get_current_candidate(
    identity=Depends(get_current_identity),
):
    if identity["type"] != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate authentication required.",
        )
    return identity["user"]
