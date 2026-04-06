import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application-wide configuration loaded from environment variables."""

    APP_TITLE: str = "HRMS Lite API"
    APP_VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # Handle postgres:// vs postgresql:// (some providers use postgres://)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set. Check your environment variables.")


settings = Settings()
