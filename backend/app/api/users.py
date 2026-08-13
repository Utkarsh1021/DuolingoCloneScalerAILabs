"""User API routes."""

from datetime import date, datetime
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, status

from ...db import get_db
from ...models.user import User
from ...schemas.user import UserSummary, UserDetail
from ...services.streak_service import StreakService
from ...services.heart_service import HeartService


router = APIRouter(prefix="/api", tags=["users"])


@router.get("/me", response_model=UserDetail)
def get_me(db: Session = Depends(get_db)):
    """Get current user profile."""
    user = db.query(User).first()
    if not user:
        # Return a default user if none exists
        user = User(
            name="Utkarsh",
            email="utkarsh@example.com",
            xp=0,
            streak=0,
            hearts=5,
            gems=120,
            daily_goal=20,
            last_active_date=datetime.now(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Calculate streak
    today = date.today()
    if user.last_active_date is None:
        streak = 1
    else:
        streak = StreakService.calculate_streak(
            user.last_active_date.date(),
            today,
        )

    # Calculate hearts regeneration
    current_time = datetime.now()
    hearts, _ = HeartService.regenerate_hearts(
        user.last_active_date if isinstance(user.last_active_date, datetime) else None,
        current_time,
        user.hearts,
        5,
    )

    # Fetch achievements count
    achievements_count = len(user.achievements) if user.achievements else 0

    return UserDetail(
        id=user.id,
        name=user.name,
        xp=user.xp,
        streak=streak,
        hearts=hearts,
        gems=user.gems,
        daily_goal=user.daily_goal,
        last_active_date=user.last_active_date,
        total_skills_completed=len(user.skill_progress) if user.skill_progress else 0,
        achievements_count=achievements_count,
    )


@router.post("/me/reset-streak", status_code=status.HTTP_200_OK)
def reset_streak(db: Session = Depends(get_db)):
    """Reset user streak (for testing)."""
    user = db.query(User).first()
    if user:
        user.streak = 0
        user.last_active_date = datetime.now()
        db.commit()
    return {"message": "Streak reset"}