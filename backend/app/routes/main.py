from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .auth import router as auth_router
from .resumes import router as resumes_router
from .export import router as export_router
from .parse_resume import router as parse_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResumeForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(resumes_router)
app.include_router(export_router)
app.include_router(parse_router)

@app.get("/")
def read_root():
    return {"message": "ResumeForge API is running"}