import PyPDF2
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    # file_bytes = raw binary content of the uploaded PDF
    # io.BytesIO wraps it so PyPDF2 can read it like a file
    # without actually saving it to disk first
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    
    text = ""
    for page in pdf_reader.pages:
        # loop through every page, extract text, join it all
        text += page.extract_text() or ""
    
    return text.strip()