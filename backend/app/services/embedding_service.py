from sentence_transformers import SentenceTransformer

# Load the embedding model only once when the server starts
model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str):
    """
    Generate a semantic embedding for any text.
    Returns a Python list of floats.
    """

    if text is None:
        text = ""

    embedding = model.encode(
        text,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    return embedding.tolist()


# ----------------------------------------------------
# Backward compatibility
# If any old file still imports get_embedding(),
# it will continue to work.
# ----------------------------------------------------

def get_embedding(text: str):
    return generate_embedding(text)