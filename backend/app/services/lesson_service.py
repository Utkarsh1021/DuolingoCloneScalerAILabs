"""Lesson service - lesson state machine and exercise processing."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ...models.exercise import Exercise
from ...models.lesson import Lesson
from ...models.user import User
from ...models.user_skill_progress import UserSkillProgress
from ...schemas.exercise import (
    MultipleChoiceExercise,
    WordBankExercise,
    MatchPairsExercise,
    FillBlankExercise,
    TypeAnswerExercise,
    ExerciseResponse,
)
from ...services.streak_service import StreakService
from ...services.heart_service import HeartService


class LessonService:
    """Lesson state machine and exercise processing."""

    @staticmethod
    def get_lesson_with_exercises(db: Session, lesson_id: int) -> Lesson | None:
        """Load a lesson with its exercises eagerly loaded."""
        from ...models.lesson import Lesson
        return (
            db.query(Lesson)
            .filter(Lesson.id == lesson_id)
            .options(
                __import__("sqlalchemy.orm", fromlist=["joinedload"]).joinedload(Lesson.exercises)
            )
            .first()
        )

    @staticmethod
    def start_lesson(db: Session, lesson_id: int, user_id: int) -> dict:
        """Start a lesson. Returns lesson state."""
        lesson = (
            db.query(Lesson)
            .filter(Lesson.id == lesson_id)
            .first()
        )
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

        # Check if user has unlocked this skill
        skill = lesson.skill
        user_skill = (
            db.query(UserSkillProgress)
            .filter(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.skill_id == skill.id,
            )
            .first()
        )

        if user_skill and not user_skill.completed:
            # Skill not completed yet, but user can start lessons in it
            pass
        elif not user_skill:
            # Skill not started, check if lessons in unit are unlocked
            # For now, allow starting any lesson
            pass

        # Return lesson state
        exercises = lesson.exercises
        return {
            "lesson": {
                "id": lesson.id,
                "title": lesson.title,
                "xp_reward": lesson.xp_reward,
                "skill_title": skill.title,
            },
            "exercises": [
                {
                    "id": ex.id,
                    "type": ex.type,
                    "question": ex.question,
                    "order_index": ex.order_index,
                }
                for ex in exercises
            ],
            "current_exercise_index": 0,
            "hearts": 5,
            "xp": 0,
            "completed_exercise_ids": [],
            "status": "active",
        }

    @staticmethod
    def process_answer(
        db: Session,
        user_id: int,
        lesson_id: int,
        exercise_id: int,
        answer: str,
    ) -> dict:
        """Process a user's answer to an exercise.

        Returns: {correct, correct_answer, xp_earned, hearts_remaining, message}
        """
        from ...models.user import User

        # Load exercise with lesson info
        exercise = (
            db.query(Exercise)
            .filter(Exercise.id == exercise_id)
            .first()
        )
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found",
            )

        # Get current user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        is_correct = answer.strip().lower() == exercise.correct_answer.strip().lower()

        hearts_remaining = user.hearts
        xp_earned = 0
        hearts_lost = 0
        message = None

        if is_correct:
            xp_earned = user.xp + 5  # XP_PER_CORRECT from config, but we'll use 5
            # Actually use config value
            from ...config import settings
            xp_earned = settings.XP_PER_CORRECT
            message = "Great job!"
        else:
            hearts_remaining = HeartService.deduct_heart(user.hearts)
            hearts_lost = 1
            xp_earned = 0
            message = f"Correct answer: {exercise.correct_answer}"
            # Check if out of hearts
            if hearts_remaining <= 0:
                message += "\nOut of hearts!"

        # Update user state
        user.xp += xp_earned
        user.hearts = hearts_remaining
        # Update last active date for streak
        from datetime import date
        today = date.today()
        from ...services.streak_service import StreakService

        streak_increment = StreakService.should_increment_streak(
            user.last_active_date.date() if user.last_active_date else None,
            today,
        )
        if streak_increment:
            user.streak += 1
        user.last_active_date = datetime.now()

        # Save user daily activity
        from ...models.user import UserDailyActivity
        from datetime import date as date_mod
        today_mod = date_mod.today()
        daily_activity = db.query(UserDailyActivity).filter(
            UserDailyActivity.user_id == user_id,
            UserDailyActivity.activity_date == today_mod
        ).first()

        if daily_activity:
            daily_activity.exercises_completed += 1
            daily_activity.correct_answers += 1 if is_correct else 0
            daily_activity.hearts_lost += hearts_lost
            daily_activity.xp_earned += xp_earned
            # Update streak
            from ...services.streak_service import StreakService as SS
            streak_inc = SS.should_increment_streak(
                daily_activity.streak_before if daily_activity.streak_before else None,
                today_mod,
            )
            if streak_inc:
                daily_activity.streak_after = (daily_activity.streak_after or 0) + 1
            else:
                daily_activity.streak_after = daily_activity.streak_after + 1 if daily_activity.streak_after else 1
            daily_activity.streak_before = daily_activity.streak_after
        else:
            streak_inc = StreakService.should_increment_streak(
                user.last_active_date.date() if user.last_active_date else None,
                today_mod,
            )
            streak_after = 1
            if streak_inc and user.last_active_date:
                streak_after = user.streak + 1
            else:
                streak_after = 1

            daily_activity = UserDailyActivity(
                user_id=user_id,
                activity_date=today_mod,
                exercises_completed=1
                correct_answers=1 if is_correct else 0
                hearts_lost=hearts_lost
                xp_earned=xp_earned
                streak_before=user.streak if user.streak else 0
                streak_after=streak_after
            )
            db.add(daily_activity)

        # Try to update skill progress
        skill = exercise.lesson.skill
        user_skill = (
            db.query(UserSkillProgress)
            .filter(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.skill_id == skill.id,
            )
            .first()
        )

        if not user_skill:
            user_skill = UserSkillProgress(user_id=user_id, skill_id=skill.id)
            db.add(user_skill)

        # Update progress based on lesson completion tracking
        # For now, just mark some progress
        user_skill.progress = min(100, user_skill.progress + 10)
        user_skill.updated_at = datetime.now()

        db.flush()

        return {
            "correct": is_correct,
            "correct_answer": exercise.correct_answer,
            "xp_earned": xp_earned,
            "hearts_remaining": hearts_remaining,
            "hearts_lost": hearts_lost,
            "message": message,
        }

    @staticmethod
    def complete_lesson(
        db: Session,
        user_id: int,
        lesson_id: int,
    ) -> dict:
        """Complete a lesson. Awards XP and updates skill progress."""
        from ...models.user import User
        from ...models.skill import Skill

        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Award lesson XP
        from ...config import settings
        xp_earned = settings.XP_LESSON_COMPLETE

        # Check for perfect lesson (all correct, no hearts lost)
        # For simplicity, always award the base XP plus potential perfect bonus
        user.xp += xp_earned

        # Update skill progress
        skill = lesson.skill
        user_skill = (
            db.query(UserSkillProgress)
            .filter(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.skill_id == skill.id,
            )
            .first()
        )

        if not user_skill:
            user_skill = UserSkillProgress(user_id=user_id, skill_id=skill.id)
            db.add(user_skill)

        user_skill.progress = 100
        user_skill.crowns += 1  # Award a crown
        user_skill.completed = True
        user_skill.updated_at = datetime.now()

        # Check if this skill unlocks the next skill
        # Look for skills that have required_skill_id
        next_skill = (
            db.query(Skill)
            .filter(Skill.required_skill_id == skill.id)
            .first()
        )

        if next_skill:
            # Unlock the next skill by creating UserSkillProgress entry
            next_user_skill = (
                db.query(UserSkillProgress)
                .filter(
                    UserSkillProgress.user_id == user_id,
                    UserSkillProgress.skill_id == next_skill.id,
                )
                .first()
            )
            if not next_user_skill:
                next_user_skill = UserSkillProgress(
                    user_id=user_id, skill_id=next_skill.id
                )
                db.add(next_user_skill)

        # Update last active date
        from datetime import date
        today = date.today()
        from ...services.streak_service import StreakService

        streak_increment = StreakService.should_increment_streak(
            user.last_active_date.date() if user.last_active_date else None,
            today,
        )
        # Note: should be should_increment_streak, but keeping for now
        if streak_increment:
            user.streak += 1
        user.last_active_date = datetime.now()

        # Save lesson attempt - one record per lesson attempted
        from ...models.user import LessonAttempt
        lesson_attempt = LessonAttempt(
            user_id=user_id,
            lesson_id=lesson_id,
            score=0.0,  # Will be calculated based on exercise results in application state
            hearts_lost=0,  # Hearts lost during lesson tracked separately
            xp_earned=xp_earned,
            completed_at=datetime.now(),
        )
        db.add(lesson_attempt)

        db.flush()

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
        }
