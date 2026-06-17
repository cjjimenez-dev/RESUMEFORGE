from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


# --- Resume Sub-Schemas ---
class PersonalInfoSchema(BaseModel):
    full_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    website: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    summary: Optional[str] = ""
    title: Optional[str] = ""
    location: Optional[str] = ""

class ExperienceSchema(BaseModel):
    job_title: Optional[str] = ""
    company: Optional[str] = ""
    location: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    current: Optional[bool] = False
    description: Optional[str] = ""

class EducationSchema(BaseModel):
    degree: Optional[str] = ""
    school: Optional[str] = ""
    location: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    gpa: Optional[str] = ""
    description: Optional[str] = ""

class ProjectSchema(BaseModel):
    title: Optional[str] = ""
    role: Optional[str] = ""
    link: Optional[str] = ""
    description: Optional[str] = ""

class SkillSchema(BaseModel):
    name: Optional[str] = ""
    category: Optional[str] = ""


# --- Main Resume Schemas ---
class ResumeContentSchema(BaseModel):
    personal_info: Optional[PersonalInfoSchema] = None
    experience: Optional[List[ExperienceSchema]] = []
    education: Optional[List[EducationSchema]] = []
    projects: Optional[List[ProjectSchema]] = []
    skills: Optional[List[SkillSchema]] = []

class ResumeCreate(BaseModel):
    title: str = "Untitled Resume"
    template_name: str = "classic"
    content: Optional[ResumeContentSchema] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_name: Optional[str] = None
    content: Optional[ResumeContentSchema] = None

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    template_name: str
    content: Optional[ResumeContentSchema] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
