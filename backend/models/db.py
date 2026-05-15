from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

# Base is the parent class — every table class inherits from it
# SQLAlchemy sees "class X(Base)" and knows it's a DB table
# __tablename__ = what the table is actually called in Supabase

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    # primary_key = unique identifier for each row, auto-increments
    # index=True = makes searches on this column faster

    filename = Column(String, nullable=False)
    # nullable=False = this field is required, can't be empty

    raw_text = Column(Text, nullable=False)
    # Text vs String — String has length limit (~255 chars)
    # Text = unlimited length, needed for full resume content

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # server_default=func.now() = DB automatically sets timestamp when row is created
    # you never have to manually pass created_at when inserting


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)  # optional
    raw_description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    # ForeignKey = links this table to another table
    # "resumes.id" means this value must exist in resumes table
    # this is how relational databases connect related data

    match_score = Column(Float, nullable=True)
    # Float = decimal number like 87.5 (percentage match)
    # nullable=True because score is calculated after creation

    skill_gaps = Column(Text, nullable=True)
    # stores AI response about missing skills as text

    status = Column(String, default="applied")
    # tracks application status: applied, interview, rejected, offered

    created_at = Column(DateTime(timezone=True), server_default=func.now())