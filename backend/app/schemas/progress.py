"""Progress-related schemas."""

from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class UserSkillProgressSummary(BaseModel):
    id: int
    skill_id: int
    progress: int  # 0-100
    crowns: int
    completed: bool

    class Config:
        from_attributes = True


class LessonAttemptCreate(BaseModel):
    exercise_id: int
    answer: str


class LessonAttemptResponse(BaseModel):
    correct: bool
    correct_answer: str
    xp_earned: int
    hearts_remaining: int
    message: Optional[str] = None


class LessonCompleteResponse(BaseModel):
    completed: bool
    xp_earned: int
    total_xp: int
    streak: int
    skill_progress: int  # 0-100
    skill_completed: bool
    hearts_lost: int
    message: str


class PathUnitResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    order_index: int
    skills: list["SkillPathResponse"] = []

    class Config:
        from_attributes = True


class SkillPathResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    order_index: int
    status: str = "locked"  # locked, available, completed
    progress: int = 0
    crowns: int = 0
    lessons_count: int = 0
    first_lesson_id: Optional[int] = None

    class Config:
        from_attributes = True