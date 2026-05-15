from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models.db
import uvicorn
import os
from routes.resume import router as resume_router
from routes.jobs import router as jobs_router
from routes.tracker import router as tracker_router
from routes.scraper import router as scraper_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://job-platform-opal.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(jobs_router)
app.include_router(tracker_router)
app.include_router(scraper_router)

@app.get("/")
def root():
    return {"status": "running"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)