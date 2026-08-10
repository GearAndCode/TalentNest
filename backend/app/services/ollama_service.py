import json
import logging
import re
from typing import Any, Dict, List

import ollama

# Configure logger for production debugging
logger = logging.getLogger("talentnest.services.ollama")

MODEL = "llama3.2:3b"

# High-precision System Prompt enforcing semantic recruiter analysis and strict JSON output
SYSTEM_PROMPT = """You are TalentNest AI Recruiter, an expert Executive Talent Acquisition Specialist.
Your task is to evaluate a candidate's resume against a job description using deep semantic reasoning.

CRITICAL INSTRUCTIONS:
1. SEMANTIC MATCHING: Look past exact keyword matches. Recognize functional equivalence (e.g., FastAPI -> Python Backend, React -> Frontend, Docker -> Containerization, AWS -> Cloud Computing, PyTorch -> Machine Learning).
2. TRANSFERABLE SKILLS: Credit core competencies like Leadership, Communication, Problem Solving, Project Management, Critical Thinking, Adaptability, and Mentoring whenever supported by background experience.
3. NO MATCH SCORES: Do NOT output percentages, similarity scores, or numerical ratings. Similarity is computed externally. Focus strictly on qualitative recruiter reasoning.
4. STRICT TRUTHFULNESS: Base your evaluation solely on provided texts. Never hallucinate. If data for a field is missing, use "Not Mentioned".
5. INTERVIEW QUESTIONS: You MUST generate EXACTLY 5 distinct, highly actionable interview question strings tailored to the role and candidate's experience. NEVER return empty strings (""). If the candidate's background lacks specific details, base the questions on core technical/functional challenges from the job description.
6. FORMAT EXCLUSIVITY: Output MUST be strictly valid, raw JSON. Do NOT include markdown blocks (no ```json fences), no conversational preambles, and no postscript explanations.

OUTPUT SCHEMA:
Return a JSON object conforming strictly to this structural template:

{
  "overall_summary": "Concise executive overview of candidate alignment with key role requirements.",
  "recommendation": "Clear strategic recruiter advice on whether to proceed with this applicant.",
  "match_level": "High",
  "matched_skills": [
    "Skill or technology aligned semantically or directly"
  ],
  "missing_skills": [
    "Required skill or domain knowledge absent from resume"
  ],
  "transferable_skills": [
    "Demonstrated soft or functional transferable skill"
  ],
  "strengths": [
    "Key area of candidate strength or competitive advantage"
  ],
  "weaknesses": [
    "Primary gap, limitation, or potential concern"
  ],
  "experience_analysis": {
    "years_of_experience": "Estimated total relevant career years or Not Mentioned",
    "relevant_experience": "Specific analysis of experience applicability",
    "industry_fit": "Assessment of background alignment with target domain"
  },
  "education_analysis": {
    "education_match": "Degree relevance assessment or Not Mentioned",
    "certifications": [
      "Relevant professional certification"
    ]
  },
  "risk_flags": [
    "Specific potential operational or qualification risk"
  ],
  "interview_focus": [
    "Key technical or functional topic to verify during interview"
  ],
  "interview_questions": [
    "Tailored interview question 1",
    "Tailored interview question 2",
    "Tailored interview question 3",
    "Tailored interview question 4",
    "Tailored interview question 5"
  ],
  "hiring_decision": {
    "recommend_for_interview": true,
    "confidence": "High",
    "reason": "Direct summary rationale for interview recommendation decision"
  }
}

VALIDATION CHECKS:
- "match_level" and "confidence" MUST be one of: "High", "Medium", or "Low".
- "recommend_for_interview" MUST be a boolean (true or false).
- All list fields MUST be valid JSON arrays of non-empty strings.
- Output ONLY the valid JSON string."""

# Reference template used to ensure all top-level and nested keys are always present
DEFAULT_SCHEMA_TEMPLATE: Dict[str, Any] = {
    "overall_summary": "Not Mentioned",
    "recommendation": "Not Mentioned",
    "match_level": "Medium",
    "matched_skills": [],
    "missing_skills": [],
    "transferable_skills": [],
    "strengths": [],
    "weaknesses": [],
    "experience_analysis": {
        "years_of_experience": "Not Mentioned",
        "relevant_experience": "Not Mentioned",
        "industry_fit": "Not Mentioned",
    },
    "education_analysis": {
        "education_match": "Not Mentioned",
        "certifications": [],
    },
    "risk_flags": [],
    "interview_focus": [],
    "interview_questions": [],
    "hiring_decision": {
        "recommend_for_interview": False,
        "confidence": "Medium",
        "reason": "Not Mentioned",
    },
}


def _extract_and_clean_json(raw_content: str) -> str:
    """
    Extracts, cleans, and isolates valid JSON strings from raw LLM output.
    Handles markdown fences, preliminary dialogue, and trailing non-JSON artifacts.
    """
    if not raw_content:
        raise ValueError("Received empty response from Ollama model.")

    content = raw_content.strip()

    # Step 1: Strip standard markdown code blocks if wrapped around whole output
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\s*```$", "", content)
        content = content.strip()

    # Step 2: Locate first '{' and last '}' to handle surrounding conversational text
    start_idx = content.find("{")
    end_idx = content.rfind("}")

    if start_idx == -1 or end_idx == -1 or start_idx > end_idx:
        raise ValueError(f"No JSON object boundary found in model output:\n{raw_content}")

    # Isolate JSON content substring
    cleaned_json_str = content[start_idx : end_idx + 1].strip()
    return cleaned_json_str


def _sanitize_and_enforce_schema(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures all expected keys exist, normalizes array types, and specifically converts
    interview_questions into a list of strings if returned as a single string or invalid structure.
    """
    if not isinstance(parsed_data, dict):
        raise ValueError("Parsed JSON root is not a dictionary.")

    # Guarantee all root schema keys exist
    for key, default_val in DEFAULT_SCHEMA_TEMPLATE.items():
        if key not in parsed_data or parsed_data[key] is None:
            parsed_data[key] = default_val

    # Ensure nested objects exist
    if not isinstance(parsed_data.get("experience_analysis"), dict):
        parsed_data["experience_analysis"] = DEFAULT_SCHEMA_TEMPLATE["experience_analysis"].copy()
    else:
        for sub_k, sub_v in DEFAULT_SCHEMA_TEMPLATE["experience_analysis"].items():
            if sub_k not in parsed_data["experience_analysis"] or parsed_data["experience_analysis"][sub_k] is None:
                parsed_data["experience_analysis"][sub_k] = sub_v

    if not isinstance(parsed_data.get("education_analysis"), dict):
        parsed_data["education_analysis"] = DEFAULT_SCHEMA_TEMPLATE["education_analysis"].copy()
    else:
        for sub_k, sub_v in DEFAULT_SCHEMA_TEMPLATE["education_analysis"].items():
            if sub_k not in parsed_data["education_analysis"] or parsed_data["education_analysis"][sub_k] is None:
                parsed_data["education_analysis"][sub_k] = sub_v

    if not isinstance(parsed_data.get("hiring_decision"), dict):
        parsed_data["hiring_decision"] = DEFAULT_SCHEMA_TEMPLATE["hiring_decision"].copy()
    else:
        for sub_k, sub_v in DEFAULT_SCHEMA_TEMPLATE["hiring_decision"].items():
            if sub_k not in parsed_data["hiring_decision"] or parsed_data["hiring_decision"][sub_k] is None:
                parsed_data["hiring_decision"][sub_k] = sub_v

    # Array field normalization helper
    array_fields = [
        "matched_skills",
        "missing_skills",
        "transferable_skills",
        "strengths",
        "weaknesses",
        "risk_flags",
        "interview_focus",
    ]
    for field in array_fields:
        val = parsed_data.get(field)
        if isinstance(val, str):
            parsed_data[field] = [item.strip() for item in val.split("\n") if item.strip()]
        elif not isinstance(val, list):
            parsed_data[field] = []

    # Certifications normalization
    certs = parsed_data["education_analysis"].get("certifications")
    if isinstance(certs, str):
        parsed_data["education_analysis"]["certifications"] = [c.strip() for c in certs.split("\n") if c.strip()]
    elif not isinstance(certs, list):
        parsed_data["education_analysis"]["certifications"] = []

    # Specific strict normalization for interview_questions array
    questions = parsed_data.get("interview_questions")
    if isinstance(questions, str):
        # Handle string split by lines or numbered items
        split_q = [
            re.sub(r"^\d+[\.\)]\s*", "", q).strip()
            for q in questions.split("\n")
            if q.strip()
        ]
        parsed_data["interview_questions"] = [q for q in split_q if q]
    elif isinstance(questions, list):
        sanitized_questions: List[str] = []
        for q in questions:
            if isinstance(q, str) and q.strip():
                clean_q = re.sub(r"^\d+[\.\)]\s*", "", q).strip()
                sanitized_questions.append(clean_q)
        parsed_data["interview_questions"] = sanitized_questions
    else:
        parsed_data["interview_questions"] = []

    return parsed_data


def analyze_candidate(
    resume_text: str,
    job_description: str
) -> Dict[str, Any]:
    """
    Analyzes candidate resume against job description using Ollama recruiter model.

    Args:
        resume_text (str): Complete parsed resume text.
        job_description (str): Complete target job description text.

    Returns:
        Dict[str, Any]: Structured candidate recruiter analysis matching TalentNest schema.

    Raises:
        ValueError: If model response is unparseable or malformed.
        RuntimeError: If connection to Ollama fails.
    """
    user_prompt = f"""Evaluate candidate resume against job description.

Candidate Resume:
--------------------
{resume_text}

Job Description:
--------------------
{job_description}

Return candidate recruiter analysis strictly conforming to the system JSON format.
"""

    try:
        response = ollama.chat(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.1,
                "top_p": 0.9,
                "num_predict": 1500,
            },
        )
    except Exception as err:
        logger.error(f"Failed to communicate with Ollama service: {str(err)}")
        raise RuntimeError(f"Ollama execution error: {str(err)}") from err

    raw_content = response.get("message", {}).get("content", "")

    print("\n========== OLLAMA RAW RESPONSE ==========\n")
    print(raw_content)
    print("\n=========================================\n")

    cleaned_json_str = _extract_and_clean_json(raw_content)

    print("\n========== CLEANED JSON ==========\n")
    print(cleaned_json_str)
    print("\n==================================\n")

    try:
        parsed_data: Dict[str, Any] = json.loads(cleaned_json_str)
    except json.JSONDecodeError as e:
        print("\n========== JSON PARSE ERROR ==========\n")
        print(f"Error: {e}")
        print(f"Content Attempted: {cleaned_json_str}")
        print("\n======================================\n")
        logger.error(f"Failed to parse Ollama output as JSON: {str(e)}")
        raise ValueError(f"Model output could not be parsed as valid JSON: {str(e)}") from e

    # Apply schema enforcement and data sanitization
    final_result = _sanitize_and_enforce_schema(parsed_data)

    return final_result