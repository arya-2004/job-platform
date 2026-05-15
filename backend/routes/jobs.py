from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.db import Job, Resume, Application
from services.ai import analyze_resume_against_job

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class JobInput(BaseModel):
    title: str
    company: str = ""
    description: str

class AnalyzeRequest(BaseModel):
    resume_id: int
    job_id: int

@router.post("/add")
def add_job(job: JobInput, db: Session = Depends(get_db)):
    new_job = Job(
        title=job.title,
        company=job.company,
        raw_description=job.description
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"id": new_job.id, "title": new_job.title, "message": "Job saved"}

@router.post("/analyze")
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    job = db.query(Job).filter(Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    result = analyze_resume_against_job(resume.raw_text, job.raw_description)
    application = Application(
        resume_id=resume.id,
        job_id=job.id,
        match_score=result["match_score"],
        skill_gaps=", ".join(result["skill_gaps"])
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return {
        "application_id": application.id,
        "match_score": result["match_score"],
        "skill_gaps": result["skill_gaps"],
        "strong_points": result["strong_points"],
        "rewritten_bullets": result["rewritten_bullets"],
        "summary": result["summary"]
    }

@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"id": job.id, "title": job.title, "company": job.company}