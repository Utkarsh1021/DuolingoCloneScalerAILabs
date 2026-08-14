"""User API routes."""

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User, UserDailyActivity
from app.schemas.user import UserDetail
from app.services.streak_service import StreakService
from app.services.heart_service import HeartService

router = APIRouter(prefix="/api", tags=["users"])


def _build_user_detail(user: User, db: Session) -> UserDetail:
    today = date.today()
    streak = StreakService.calculate_streak(
        user.streak,
        user.last_active_date.date() if user.last_active_date else None,
        today,
    )
    hearts, _ = HeartService.regenerate_hearts(
        user.last_active_date if isinstance(user.last_active_date, datetime) else None,
        datetime.now(),
        user.hearts,
        5,
    )
    daily = (
        db.query(UserDailyActivity)
        .filter(
            UserDailyActivity.user_id == user.id,
            UserDailyActivity.activity_date == today,
        )
        .first()
    )
    xp_today = daily.xp_earned if daily else 0
    return UserDetail(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        xp=user.xp,
        streak=streak,
        hearts=hearts,
        gems=user.gems,
        daily_goal=user.daily_goal,
        last_active_date=user.last_active_date,
        total_skills_completed=len(user.skill_progress) if user.skill_progress else 0,
        achievements_count=len(user.achievements) if user.achievements else 0,
        earned_achievement_ids=(
            [ua.achievement_id for ua in user.achievements] if user.achievements else []
        ),
        xp_today=xp_today,
    )


@router.get("/user", response_model=UserDetail)
def get_current_user(db: Session = Depends(get_db)):
    """Get the default (only) signed-in user profile."""
    user = db.query(User).order_by(User.id).first()
    if not user:
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
    return _build_user_detail(user, db)


@router.post("/me/reset-streak", status_code=status.HTTP_200_OK)
def reset_streak(db: Session = Depends(get_db)):
    """Reset the default user's streak (for testing)."""
    user = db.query(User).order_by(User.id).first()
    if user:
        user.streak = 0
        user.last_active_date = datetime.now()
        db.commit()
    return {"message": "Streak reset"}


@router.post("/me/refill-hearts", status_code=status.HTTP_200_OK)
def refill_hearts(db: Session = Depends(get_db)):
    """Refill hearts using gems (mocked purchase).

    Costs 350 gems and restores hearts to the maximum.
    """
    user = db.query(User).order_by(User.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from app.config import settings

    cost = settings.REFILL_GEM_COST
    if user.hearts >= settings.MAX_HEARTS:
        return {
            "ok": True,
            "message": "Hearts already full!",
            "hearts": user.hearts,
            "gems": user.gems,
            "already_full": True,
        }

    if user.gems < cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough gems. Need {cost}, you have {user.gems}.",
        )

    user.gems -= cost
    user.hearts = settings.MAX_HEARTS
    db.commit()
    return {
        "ok": True,
        "message": "Hearts refilled!",
        "hearts": user.hearts,
        "gems": user.gems,
        "already_full": False,
    }