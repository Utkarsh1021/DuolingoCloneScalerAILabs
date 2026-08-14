"""Leaderboard API route."""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.services.streak_service import StreakService

router = APIRouter(prefix="/api", tags=["leaderboard"])


@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Return users ranked by total XP."""
    today = date.today()
    users = db.query(User).order_by(User.xp.desc()).all()
    return [
        {
            "rank": idx + 1,
            "name": user.name,
            "xp": user.xp,
            "streak": StreakService.calculate_streak(
                user.streak,
                user.last_active_date.date() if user.last_active_date else None,
                today,
            ),
            "avatar": user.avatar,
        }
        for idx, user in enumerate(users)
    ]