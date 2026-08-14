"""Lesson API routes: start, answer, complete."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.schemas.progress import LessonAttemptCreate, LessonAttemptResponse
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


class StartResponse(BaseModel):
    lesson_id: int
    title: str
    xp_reward: int
    skill_title: str
    hearts: int
    current_exercise_index: int
    xp_earned: int
    completed_exercise_ids: list[int]
    status: str
    exercises: list[dict]


class CompleteResponse(BaseModel):
    completed: bool
    xp_earned: int
    total_xp: int
    streak: int
    skill_progress: int
    skill_completed: bool
    hearts_lost: int
    message: str
    unlocked_skill: str | None = None
    earned_achievements: list[str] = []


def _get_default_user(db: Session) -> User:
    user = db.query(User).order_by(User.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found. Create a user first.",
        )
    return user


@router.post("/{lesson_id}/start", response_model=StartResponse)
def start_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Start a lesson, returning its full state and exercises."""
    user = _get_default_user(db)
    return LessonService.start_lesson(db, lesson_id, user)


@router.post("/{lesson_id}/answer", response_model=LessonAttemptResponse)
def answer_exercise(
    lesson_id: int,
    payload: LessonAttemptCreate,
    db: Session = Depends(get_db),
):
    """Grade a single exercise answer."""
    user = _get_default_user(db)
    return LessonService.process_answer(
        db,
        user,
        lesson_id,
        payload.exercise_id,
        payload.answer,
    )


@router.post("/{lesson_id}/complete", response_model=CompleteResponse)
def complete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Complete a lesson and award XP / crowns."""
    user = _get_default_user(db)
    return LessonService.complete_lesson(db, user, lesson_id)