import json
import numpy as np


def cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)

    return np.dot(vec1, vec2) / (
        np.linalg.norm(vec1) * np.linalg.norm(vec2)
    )


def calculate_semantic_match(
    candidate_embedding,
    job_embedding
):

    similarity = cosine_similarity(
        candidate_embedding,
        job_embedding
    )

    score = round(similarity * 100)

    score = max(0, min(score, 100))

    if score >= 90:
        recommendation = "Excellent Match"

    elif score >= 75:
        recommendation = "Strong Match"

    elif score >= 60:
        recommendation = "Good Match"

    elif score >= 40:
        recommendation = "Average Match"

    else:
        recommendation = "Poor Match"

    return {
        "score": score,
        "recommendation": recommendation
    }