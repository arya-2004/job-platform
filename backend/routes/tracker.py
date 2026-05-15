from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models.db import Application, Resume, Job

router = APIRouter(prefix="/tracker", tags=["Tracker"])

# valid statuses an application can have
VALID_STATUSES = ["applied", "interview", "offer", "rejected"]

class StatusUpdate(BaseModel):
    status: str

@router.get("/applications")
def list_applications(db: Session = Depends(get_db)):
    # join = combining data from multiple tables in one query
    # instead of fetching applications then fetching each resume/job separately
    # we get everything in one DB call — much faster
    applications = db.query(Application).all()
    # .all() = returns a list of all rows, vs .first() which returns one

    result = []
    for app in applications:
        # for each application, fetch its linked resume and job
        resume = db.query(Resume).filter(Resume.id == app.resume_id).first()
        job = db.query(Job).filter(Job.id == app.job_id).first()

        result.append({
            "application_id": app.id,
            "status": app.status,
            "match_score": app.match_score,
            "skill_gaps": app.skill_gaps,
            "applied_at": app.created_at,
            "resume_filename": resume.filename if resume else None,
            "job_title": job.title if job else None,
            "company": job.company if job else None,
        })

    return result

@router.get("/applications/{application_id}")
def get_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    resume = db.query(Resume).filter(Resume.id == app.resume_id).first()
    job = db.query(Job).filter(Job.id == app.job_id).first()

    return {
        "application_id": app.id,
        "status": app.status,
        "match_score": app.match_score,
        "skill_gaps": app.skill_gaps,
        "applied_at": app.created_at,
        "resume_filename": resume.filename if resume else None,
        "job_title": job.title if job else None,
        "company": job.company if job else None,
    }

@router.patch("/applications/{application_id}/status")
def update_status(
    application_id: int,
    body: StatusUpdate,
    db: Session = Depends(get_db)
):
    # PATCH = partial update (vs PUT which replaces entire record)
    # we're only updating one field — status — so PATCH is correct
    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {VALID_STATUSES}"
        )

    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = body.status
    db.commit()
    db.refresh(app)

    return {
        "application_id": app.id,
        "status": app.status,
        "message": f"Status updated to {app.status}"
    }

@router.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db)):
    # DELETE = removes the row permanently
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(app)
    db.commit()

    return {"message": "Application deleted"}