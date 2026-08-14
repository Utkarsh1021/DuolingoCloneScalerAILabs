"""Database session and initialization."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get DB session.

    Commits the transaction when the request succeeds and rolls back on
    error so that all progress changes (XP, hearts, streak, skill progress,
    attempts, daily activity) are persisted.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def create_tables():
    """Create all tables.

    Imports the model modules so that every mapped class registers on the
    shared Base before metadata is built.
    """
    from app.models.course import Course, Unit, Skill, Lesson, Exercise  # noqa: F401
    from app.models.user import (  # noqa: F401
        User,
        UserSkillProgress,
        Achievement,
        UserAchievement,
        LessonAttempt,
        UserDailyActivity,
    )
    from app.models.base import Base

    Base.metadata.create_all(bind=engine)