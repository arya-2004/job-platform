import requests
import os
from dotenv import load_dotenv

load_dotenv()

JSEARCH_KEY = os.getenv("JSEARCH_API_KEY")

def fetch_jobs(query: str, location: str = "India", num_pages: int = 1) -> list:
    url = "https://jsearch.p.rapidapi.com/search"
    
    headers = {
        "X-RapidAPI-Key": JSEARCH_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": f"{query} in {location}",
        "page": "1",
        "num_pages": str(num_pages),
        "date_posted": "week",
        "employment_types": "FULLTIME,PARTTIME,INTERN"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        data = response.json()
        
        if "data" not in data:
            return []
        
        jobs = []
        for job in data["data"]:
            jobs.append({
                "title": job.get("job_title", ""),
                "company": job.get("employer_name", ""),
                "location": (job.get("job_city") or "") + ", " + (job.get("job_country") or ""),
                "description": job.get("job_description", ""),
                "apply_link": job.get("job_apply_link", ""),
                "date_posted": job.get("job_posted_at_datetime_utc", ""),
                "employment_type": job.get("job_employment_type", ""),
            })
        
        return jobs
    
    except Exception as e:
        print(f"JSearch error: {e}")
        return []