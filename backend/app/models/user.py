"""User model and progress models."""

from datetime import datetime, date
from sqlalchemy import (
    DateTime,
    Integer,
    String,
    ForeignKey,
    func,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from .base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    avatar: Mapped[str] = mapped_column(String(128), nullable=True, default=None)
    xp: Mapped[int] = mapped_column(default=0)
    streak: Mapped[int] = mapped_column(default=0)
    hearts: Mapped[int] = mapped_column(default=5)
    gems: Mapped[int] = mapped_column(default=120)
    daily_goal: Mapped[int] = mapped_column(default=20)
    last_active_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )

    skill_progress: Mapped[list["UserSkillProgress"]] = relationship(
        back_populates="user"
    )
    lesson_attempts: Mapped[list["LessonAttempt"]] = relationship(
        back_populates="user"
    )
    daily_activities: Mapped[list["UserDailyActivity"]] = relationship(
        back_populates="user"
    )
    achievements: Mapped[list["UserAchievement"]] = relationship(
        back_populates="user"
    )


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE")
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skill.id", ondelete="CASCADE")
    )
    progress: Mapped[int] = mapped_column(default=0)  # 0-100
    crowns: Mapped[int] = mapped_column(default=0)
    completed: Mapped[bool] = mapped_column(default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id"),
    )

    user: Mapped["User"] = relationship(back_populates="skill_progress")
    skill: Mapped["Skill"] = relationship(back_populates="user_progress")


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(String(256), nullable=True)
    icon: Mapped[str] = mapped_column(String(32), nullable=True, default="🏆")
    requirement_type: Mapped[str] = mapped_column(String(32), nullable=False)
    requirement_value: Mapped[int] = mapped_column(Integer, nullable=False)

    user_earned: Mapped[list["UserAchievement"]] = relationship(
        back_populates="achievement"
    )


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE")
    )
    achievement_id: Mapped[int] = mapped_column(
        ForeignKey("achievements.id", ondelete="CASCADE")
    )

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id"),
    )

    earned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_earned")


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE")
    )
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lesson.id", ondelete="CASCADE")
    )
    score: Mapped[float] = mapped_column(default=0.0)  # percentage correct
    hearts_lost: Mapped[int] = mapped_column(default=0)
    xp_earned: Mapped[int] = mapped_column(default=0)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="lesson_attempts")
    lesson: Mapped["Lesson"] = relationship(back_populates="attempts")


class UserDailyActivity(Base):
    __tablename__ = "user_daily_activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE")
    )
    activity_date: Mapped[date] = mapped_column(DateTime(timezone=True))
    exercises_completed: Mapped[int] = mapped_column(default=0)
    correct_answers: Mapped[int] = mapped_column(default=0)
    hearts_lost: Mapped[int] = mapped_column(default=0)
    xp_earned: Mapped[int] = mapped_column(default=0)
    streak_before: Mapped[int] = mapped_column(default=0)
    streak_after: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="daily_activities")