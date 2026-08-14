"""User-related schemas."""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class UserSummary(BaseModel):
    id: int
    name: str
    xp: int
    streak: int
    hearts: int
    gems: int

    class Config:
        from_attributes = True


class UserDetail(UserSummary):
    email: str
    avatar: Optional[str] = None
    daily_goal: int
    last_active_date: Optional[datetime]
    total_skills_completed: int = 0
    achievements_count: int = 0
    earned_achievement_ids: list[int] = []
    xp_today: int = 0

    class Config:
        from_attributes = True


class AchievementCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = Field(None, max_length=256)


class AchievementResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    earned_at: datetime

    class Config:
        from_attributes = True