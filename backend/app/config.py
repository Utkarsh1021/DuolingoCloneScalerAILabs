"""Application configuration.

All tunable constants live here so business rules (heart timings, XP, streak
logic) are easy to adjust and easy to explain.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'duolingo.db'}"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Gamification tuning
    MAX_HEARTS: int = 5
    HEART_REGEN_SECONDS: int = 30 * 60  # one heart every 30 minutes
    XP_PER_CORRECT: int = 5
    XP_LESSON_COMPLETE: int = 10
    XP_PERFECT_BONUS: int = 5
    DEFAULT_DAILY_GOAL: int = 20
    DEFAULT_GEMS: int = 120
    REFILL_GEM_COST: int = 350

    # Seed
    SEED_ON_STARTUP: bool = True

    @property
    def sqlite_path(self) -> Path:
        return Path(self.DATABASE_URL.replace("sqlite:///", ""))


settings = Settings()
