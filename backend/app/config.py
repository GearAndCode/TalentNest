from dotenv import load_dotenv
import os


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
)


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# Google OAuth / Google Identity Services
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "1034068374242-qumdm0600c5m5h2j10rlaurnn4m0u9o4.apps.googleusercontent.com",
)
