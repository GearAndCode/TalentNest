import pdfplumber
import re
import spacy

from app.services.embedding_service import generate_embedding

nlp = spacy.load("en_core_web_sm")


# ---------------- PDF TEXT EXTRACTION ----------------

def extract_text(pdf_path):
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    return text


# ---------------- EMAIL ----------------

def extract_email(text):

    match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    return match.group(0) if match else None


# ---------------- PHONE ----------------

def extract_phone(text):

    match = re.search(
        r"(\+?\d[\d\s\-]{8,}\d)",
        text
    )

    return match.group(0) if match else None


# ---------------- NAME ----------------

def extract_name(text):

    lines = text.split("\n")

    for line in lines[:8]:

        line = line.strip()

        if not line:
            continue

        if "@" in line:
            continue

        if any(char.isdigit() for char in line):
            continue

        if len(line.split()) < 2:
            continue

        if len(line.split()) > 4:
            continue

        if line.isupper():
            return line.title()

        return line

    doc = nlp(text)

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text

    return None


# ---------------- SKILLS ----------------

SKILLS = [
    "Python",
    "Java",
    "C++",
    "Flutter",
    "Dart",
    "React",
    "React Native",
    "Node.js",
    "Express",
    "FastAPI",
    "Django",
    "Flask",
    "Spring Boot",
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Angular",
    "Vue",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Firebase",
    "Git",
    "GitHub",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Data Analysis",
    "Power BI",
    "Excel",
    "Figma",
    "UI/UX",
    "Teaching",
    "IELTS",
    "Communication",
    "Leadership",
    "Problem Solving"
]


def extract_skills(text):

    found = []

    lower = text.lower()

    for skill in SKILLS:

        if skill.lower() in lower:
            found.append(skill)

    return list(set(found))


# ---------------- MAIN PARSER ----------------

def parse_resume(pdf_path):

    text = extract_text(pdf_path)

    embedding = generate_embedding(text)

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "raw_text": text,
        "embedding": embedding
    }