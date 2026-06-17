from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .database import get_db
from .models import Resume, User
from .schemas import ResumeCreate, ResumeUpdate, ResumeResponse
from .auth import get_current_user

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

@router.get("", response_model=List[ResumeResponse])
def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.updated_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    return resume

@router.post("", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def create_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Convert content Pydantic model to dictionary for database insertion
    content_dict = resume_data.content.dict() if resume_data.content else None
    
    new_resume = Resume(
        user_id=current_user.id,
        title=resume_data.title,
        template_name=resume_data.template_name,
        content=content_dict
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume

@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int,
    resume_data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume_data.title is not None:
        resume.title = resume_data.title
    if resume_data.template_name is not None:
        resume.template_name = resume_data.template_name
    if resume_data.content is not None:
        resume.content = resume_data.content.dict()
        
    db.commit()
    db.refresh(resume)
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    db.delete(resume)
    db.commit()
    return None
