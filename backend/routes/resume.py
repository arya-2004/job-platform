from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.db import Resume
from services.parser import extract_text_from_pdf

# APIRouter = mini FastAPI app for just this feature
# we register it in main.py so the main app knows about it
# this keeps resume routes separate from job routes, tracker routes etc.
router = APIRouter(prefix="/resume", tags=["Resume"])
# prefix="/resume" means all routes here start with /resume
# tags=["Resume"] groups them in the /docs page

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # UploadFile = FastAPI's type for uploaded files
    # File(...) = this field is required (... means required in Pydantic)
    # Depends(get_db) = FastAPI automatically calls get_db()
    # and injects the DB session — you don't call it manually
    # async = this function is asynchronous, meaning it can handle
    # multiple requests at the same time without blocking

    # validate it's a PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
        # HTTPException = sends an error response back to the client
        # status_code=400 = "Bad Request" (client sent wrong data)
        # Common codes: 200=OK, 201=Created, 400=Bad Request, 
        # 404=Not Found, 500=Server Error

    # read file content as bytes
    file_bytes = await file.read()
    # await = wait for this async operation to finish before continuing
    # reading files is I/O (input/output) — async prevents blocking

    # extract text
    raw_text = extract_text_from_pdf(file_bytes)

    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # save to database
    resume = Resume(filename=file.filename, raw_text=raw_text)
    # creates a Resume object — not saved yet, just built in memory

    db.add(resume)      # adds it to the session (staging area)
    db.commit()         # actually writes to Supabase
    db.refresh(resume)  # refreshes object to get DB-generated values like id

    return {
        "id": resume.id,
        "filename": resume.filename,
        "text_preview": raw_text[:200],  # first 200 chars as preview
        "message": "Resume uploaded successfully"
    }

@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    # {resume_id} = URL parameter, e.g. /resume/1
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    # db.query(Resume) = SELECT * FROM resumes
    # .filter(...) = WHERE id = resume_id
    # .first() = LIMIT 1, returns None if not found

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {
        "id": resume.id,
        "filename": resume.filename,
        "raw_text": resume.raw_text,
        "created_at": resume.created_at
    }