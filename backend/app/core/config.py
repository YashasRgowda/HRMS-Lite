import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application-wide configuration loaded from environment variables."""

    APP_TITLE: str = "HRMS Lite API"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set. Check your .env file.")


settings = Settings()
