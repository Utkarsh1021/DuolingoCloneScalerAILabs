"""Achievement service - checks and awards achievements."""

from sqlalchemy.orm import Session

from app.models.user import Achievement, UserAchievement


class AchievementService:
    """Awards achievements when their requirements are met."""

    @staticmethod
    def _earn(
        db: Session,
        user_id: int,
        achievement: Achievement,
    ) -> bool:
        """Award a single achievement if not already earned."""
        existing = (
            db.query(UserAchievement)
            .filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement.id,
            )
            .first()
        )
        if existing:
            return False
        db.add(UserAchievement(user_id=user_id, achievement_id=achievement.id))
        return True

    @staticmethod
    def check_and_award(
        db: Session,
        user_id: int,
        total_xp: int,
        lessons_completed: int,
        streak: int,
        perfect_lesson: bool,
    ) -> list[Achievement]:
        """Evaluate each achievement definition against current stats.

        Built-in definitions, keyed by requirement_type:
        - lessons_completed: award when count >= requirement_value
        - streak: award when streak >= requirement_value
        - total_xp: award when xp >= requirement_value
        - perfect_lesson: award when a perfect lesson was just completed

        Returns the list of newly earned achievements.
        """
        earned = []
        for achievement in db.query(Achievement).all():
            req_type = achievement.requirement_type
            req_value = achievement.requirement_value

            if req_type == "lessons_completed":
                met = lessons_completed >= req_value
            elif req_type == "total_xp":
                met = total_xp >= req_value
            elif req_type == "perfect_lesson":
                met = perfect_lesson and req_value <= 1
            elif req_type == "streak":
                met = streak >= req_value
            else:
                met = False

            if met and AchievementService._earn(db, user_id, achievement):
                earned.append(achievement)

        return earned


def count_lessons_completed(db: Session, user_id: int) -> int:
    """Number of lessons the user has fully completed."""
    from app.models.user import LessonAttempt

    return (
        db.query(LessonAttempt)
        .filter(LessonAttempt.user_id == user_id)
        .count()
    )