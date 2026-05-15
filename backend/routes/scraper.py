from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.db import Resume
from services.scraper import fetch_jobs
from services.ai import analyze_resume_against_job

router = APIRouter(prefix="/scraper", tags=["Scraper"])

class SearchRequest(BaseModel):
    resume_id: int
    query: str        # job title e.g. "Data Analyst"
    location: str = "India"

@router.post("/search")
def search_and_analyze(request: SearchRequest, db: Session = Depends(get_db)):
    """
    1. Fetch real jobs from JSearch
    2. Analyze each against user's resume
    3. Return ranked by match score
    """
    
    # get resume from DB
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # fetch real jobs
    jobs = fetch_jobs(request.query, request.location)
    
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found. Try different search terms.")
    
    # analyze each job against resume
    # this is where it gets interesting — we loop through jobs
    # and score each one
    results = []
    for job in jobs[:5]:  # limit to 5 to save AI API calls
        if not job["description"]:
            continue
            
        # reuse existing AI service — same function we already built
        analysis = analyze_resume_against_job(
            resume.raw_text,
            job["description"]
        )
        
        results.append({
            "job_title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "apply_link": job["apply_link"],
            "date_posted": job["date_posted"],
            "employment_type": job["employment_type"],
            "match_score": analysis["match_score"],
            "skill_gaps": analysis["skill_gaps"],
            "strong_points": analysis["strong_points"],
            "summary": analysis["summary"],
        })
    
    # sort by match score — best match first
    results.sort(key=lambda x: x["match_score"] or 0, reverse=True)
    # lambda x: x["match_score"] = for each result, use match_score as sort key
    # reverse=True = highest first
    
    return {
        "query": request.query,
        "location": request.location,
        "total_found": len(results),
        "jobs": results
    }