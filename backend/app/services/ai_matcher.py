import numpy as np

from app.services.embedding_service import generate_embedding


def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    return np.dot(a, b) / (
        np.linalg.norm(a) * np.linalg.norm(b)
    )


def calculate_match(
    candidate_embedding,
    job_description
):
    """
    Production semantic matching.

    Candidate Resume
           ↓
      Embedding

    Job Description
           ↓
      Embedding

    Cosine Similarity
           ↓
      Match %
    """

    job_embedding = generate_embedding(job_description)

    similarity = cosine_similarity(
        candidate_embedding,
        job_embedding
    )

    score = round(similarity * 100)

    if score >= 85:
        recommendation = "Excellent Match"

    elif score >= 70:
        recommendation = "Strong Match"

    elif score >= 55:
        recommendation = "Moderate Match"

    else:
        recommendation = "Weak Match"

    return {
        "score": score,
        "matched": [],
        "missing": [],
        "recommendation": recommendation
    }