from pydantic import BaseModel, EmailStr


class CandidateCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


# ---------------- REGISTER ----------------

class CandidateRegister(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str


# ---------------- LOGIN ----------------

class CandidateLogin(BaseModel):
    email: EmailStr
    password: str


# ---------------- RESPONSE ----------------

class CandidateResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    resume_path: str | None = None
    is_email_verified: bool

    class Config:
        from_attributes = True


# ---------------- OTP ----------------

class SendOTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# ---------------- PASSWORD RESET ----------------

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
