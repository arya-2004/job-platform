from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

# ChatOpenAI works with OpenRouter by just changing base_url
# this is exactly why we chose LangChain — swap models by changing
# model name string, nothing else changes
llm = ChatOpenAI(
    model="openrouter/owl-alpha",
    # this is a free model on OpenRouter
    # to swap: change this string to any other model name
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    # base_url tells LangChain to send requests to OpenRouter
    # instead of OpenAI's servers
)

# ChatPromptTemplate = reusable prompt with variables
# {resume_text} and {job_description} get filled in at runtime
prompt = ChatPromptTemplate.from_template("""
You are an expert career advisor and ATS (Applicant Tracking System) analyzer.

Analyze this resume against the job description and respond in this exact format:

MATCH_SCORE: [number 0-100]

SKILL_GAPS:
- [missing skill 1]
- [missing skill 2]
- [missing skill 3]

STRONG_POINTS:
- [what matches well 1]
- [what matches well 2]

REWRITTEN_BULLETS:
- [improved resume bullet 1]
- [improved resume bullet 2]
- [improved resume bullet 3]

SUMMARY:
[2-3 sentence overall assessment]

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
""")

# chain = prompt | llm
# this is LangChain's pipe syntax — output of prompt feeds into llm
# like Unix pipes: cat file.txt | grep "word"
chain = prompt | llm

def analyze_resume_against_job(resume_text: str, job_description: str) -> dict:
    response = chain.invoke({
        "resume_text": resume_text,
        "job_description": job_description
    })
    # response.content = the raw text response from the AI
    raw = response.content

    # parse the structured response into a dict
    result = {
        "match_score": None,
        "skill_gaps": [],
        "strong_points": [],
        "rewritten_bullets": [],
        "summary": "",
        "raw": raw  # always return raw in case parsing fails
    }

    lines = raw.split("\n")
    current_section = None

    for line in lines:
        line = line.strip()
        if line.startswith("MATCH_SCORE:"):
            try:
                result["match_score"] = float(line.split(":")[1].strip())
            except:
                pass
        elif line.startswith("SKILL_GAPS:"):
            current_section = "skill_gaps"
        elif line.startswith("STRONG_POINTS:"):
            current_section = "strong_points"
        elif line.startswith("REWRITTEN_BULLETS:"):
            current_section = "rewritten_bullets"
        elif line.startswith("SUMMARY:"):
            current_section = "summary"
        elif line.startswith("- ") and current_section in ["skill_gaps", "strong_points", "rewritten_bullets"]:
            result[current_section].append(line[2:])
        elif current_section == "summary" and line:
            result["summary"] += line + " "

    return result