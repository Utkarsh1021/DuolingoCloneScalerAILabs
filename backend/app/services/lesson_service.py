"""Lesson service - lesson state machine and exercise processing."""

import json
from datetime import datetime, date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.course import Exercise, Lesson, Skill
from app.models.user import (
    User,
    UserSkillProgress,
    LessonAttempt,
    UserDailyActivity,
)
from app.services.achievement_service import AchievementService, count_lessons_completed
from app.services.streak_service import StreakService
from app.services.heart_service import HeartService


def _parse_data(data: str | None):
    """Parse the JSON string stored in Exercise.data into a dict."""
    if not data:
        return None
    try:
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        return None


def serialize_exercise(exercise: Exercise) -> dict:
    """Serialize an exercise including its parsed data payload."""
    return {
        "id": exercise.id,
        "lesson_id": exercise.lesson_id,
        "type": exercise.type,
        "question": exercise.question or "",
        "correct_answer": exercise.correct_answer or "",
        "data": _parse_data(exercise.data),
        "order_index": exercise.order_index,
    }


class LessonService:
    """Lesson state machine and exercise processing."""

    @staticmethod
    def start_lesson(db: Session, lesson_id: int, user: User) -> dict:
        """Start a lesson and return its full state with the exercise list."""
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

        exercises = (
            db.query(Exercise)
            .filter(Exercise.lesson_id == lesson_id)
            .order_by(Exercise.order_index)
            .all()
        )

        return {
            "lesson_id": lesson.id,
            "title": lesson.title,
            "xp_reward": lesson.xp_reward,
            "skill_title": lesson.skill.title,
            "hearts": user.hearts,
            "current_exercise_index": 0,
            "xp_earned": 0,
            "completed_exercise_ids": [],
            "status": "active",
            "exercises": [serialize_exercise(ex) for ex in exercises],
        }

    @staticmethod
    def process_answer(
        db: Session,
        user: User,
        lesson_id: int,
        exercise_id: int,
        answer: str,
    ) -> dict:
        """Process a user's answer.

        Updates XP, hearts, daily activity and skill progress.
        Returns the grading result.
        """
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found",
            )

        is_correct = answer.strip().lower() == (
            exercise.correct_answer or ""
        ).strip().lower()

        # Match-pairs/word-bank style exercises are graded visually on the
        # client; here a completed non-empty answer means success.
        if not exercise.correct_answer and exercise.type in (
            "match_pairs",
            "word_bank",
        ):
            is_correct = bool(answer.strip())

        xp_earned = settings.XP_PER_CORRECT if is_correct else 0
        hearts_lost = 0 if is_correct else 1
        hearts_remaining = user.hearts
        message = "Great job!" if is_correct else "Keep going!"

        if not is_correct:
            hearts_remaining = HeartService.deduct_heart(user.hearts)
            message = f"Correct answer: {exercise.correct_answer}"

        # Update user
        user.xp += xp_earned
        user.hearts = hearts_remaining

        today = date.today()
        streak_before = user.streak
        user.streak = StreakService.compute_new_streak(
            user.streak,
            user.last_active_date.date() if user.last_active_date else None,
            today,
        )
        user.last_active_date = datetime.now()

        # Daily activity
        daily = (
            db.query(UserDailyActivity)
            .filter(UserDailyActivity.user_id == user.id)
            .filter(UserDailyActivity.activity_date == today)
            .first()
        )
        if daily:
            daily.exercises_completed += 1
            daily.correct_answers += 1 if is_correct else 0
            daily.hearts_lost += hearts_lost
            daily.xp_earned += xp_earned
        else:
            daily = UserDailyActivity(
                user_id=user.id,
                activity_date=today,
                exercises_completed=1,
                correct_answers=1 if is_correct else 0,
                hearts_lost=hearts_lost,
                xp_earned=xp_earned,
                streak_before=streak_before,
                streak_after=user.streak,
            )
            db.add(daily)

        # Skill progress
        skill = db.query(Skill).filter(Skill.id == exercise.lesson.skill_id).first()
        user_skill = (
            db.query(UserSkillProgress)
            .filter(
                UserSkillProgress.user_id == user.id,
                UserSkillProgress.skill_id == skill.id,
            )
            .first()
        )
        if not user_skill:
            user_skill = UserSkillProgress(
                user_id=user.id,
                skill_id=skill.id,
                progress=0,
                crowns=0,
            )
            db.add(user_skill)
        if is_correct:
            user_skill.progress = min(100, user_skill.progress + 20)
        elif user_skill.progress > 0:
            user_skill.progress = max(0, user_skill.progress - 10)
        user_skill.updated_at = datetime.now()

        db.flush()

        return {
            "correct": is_correct,
            "correct_answer": exercise.correct_answer or "",
            "xp_earned": xp_earned,
            "hearts_remaining": hearts_remaining,
            "hearts_lost": hearts_lost,
            "message": message,
        }

    @staticmethod
    def complete_lesson(db: Session, user: User, lesson_id: int) -> dict:
        """Complete a lesson: award XP, crown the skill, unlock the next."""
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

        skill = db.query(Skill).filter(Skill.id == lesson.skill_id).first()
        user_skill = (
            db.query(UserSkillProgress)
            .filter(
                UserSkillProgress.user_id == user.id,
                UserSkillProgress.skill_id == skill.id,
            )
            .first()
        )
        if not user_skill:
            user_skill = UserSkillProgress(
                user_id=user.id,
                skill_id=skill.id,
                progress=0,
                crowns=0,
            )
            db.add(user_skill)

        user_skill.progress = 100
        user_skill.crowns = (user_skill.crowns or 0) + 1
        user_skill.completed = True
        user_skill.updated_at = datetime.now()

        xp_earned = settings.XP_LESSON_COMPLETE
        user.xp += xp_earned

        # Unlock the next skill if it depends on this one.
        # Persist a progress row so the unlock is reflected in the DB, not
        # just in the response message.
        next_skill = (
            db.query(Skill)
            .filter(Skill.required_skill_id == skill.id)
            .order_by(Skill.order_index)
            .first()
        )
        if next_skill:
            next_up = (
                db.query(UserSkillProgress)
                .filter(
                    UserSkillProgress.user_id == user.id,
                    UserSkillProgress.skill_id == next_skill.id,
                )
                .first()
            )
            if not next_up:
                db.add(
                    UserSkillProgress(
                        user_id=user.id,
                        skill_id=next_skill.id,
                        progress=0,
                        crowns=0,
                    )
                )

        today = date.today()
        streak_before = user.streak
        user.streak = StreakService.compute_new_streak(
            user.streak,
            user.last_active_date.date() if user.last_active_date else None,
            today,
        )
        user.last_active_date = datetime.now()

        daily = (
            db.query(UserDailyActivity)
            .filter(UserDailyActivity.user_id == user.id)
            .filter(UserDailyActivity.activity_date == today)
            .first()
        )
        if daily:
            daily.xp_earned += xp_earned
        else:
            daily = UserDailyActivity(
                user_id=user.id,
                activity_date=today,
                exercises_completed=0,
                correct_answers=0,
                hearts_lost=0,
                xp_earned=xp_earned,
                streak_before=streak_before,
                streak_after=user.streak,
            )
            db.add(daily)

        db.add(
            LessonAttempt(
                user_id=user.id,
                lesson_id=lesson_id,
                score=100.0,
                hearts_lost=0,
                xp_earned=xp_earned,
                completed_at=datetime.now(),
            )
        )
        db.flush()

        # Award any qualifying achievements
        newly_earned = AchievementService.check_and_award(
            db,
            user.id,
            user.xp,
            count_lessons_completed(db, user.id),
            user.streak,
            perfect_lesson=True,
        )

        return {
            "completed": True,
            "xp_earned": xp_earned,
            "total_xp": user.xp,
            "streak": user.streak,
            "skill_progress": user_skill.progress,
            "skill_completed": user_skill.completed,
            "hearts_lost": 0,
            "message": "Lesson complete!",
            "unlocked_skill": next_skill.title if next_skill else None,
            "earned_achievements": [a.name for a in newly_earned],
        }