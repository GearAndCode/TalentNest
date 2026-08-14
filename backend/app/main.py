from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine
from app.models.company import Base

# Import models so SQLAlchemy creates all tables
from app.models import company, job, candidate, application, subscriber

from app.routers.candidate_auth import router as candidate_auth_router

# Import routers
from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.candidate import router as candidate_router
from app.routers.application import router as application_router
from app.routers.dashboard import router as dashboard_router
from app.routers.subscriber import router as subscriber_router
from app.routers.hr_access_router import router as hr_access_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TalentNest ATS Backend",
    version="1.0.0",
)


# Serve uploaded files (resumes)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


# CORS
# Allows local development and all Vercel deployments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth_router)
app.include_router(candidate_auth_router)
app.include_router(jobs_router)
app.include_router(candidate_router)
app.include_router(application_router)
app.include_router(dashboard_router)
app.include_router(subscriber_router)
app.include_router(hr_access_router)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "TalentNest Backend Running 🚀",
    }