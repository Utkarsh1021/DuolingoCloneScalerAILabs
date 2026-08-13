"""Streak service - deterministic streak logic."""

from datetime import datetime, date


class StreakService:
    """Handles streak calculation deterministically.

    Rules:
    - First activity: streak = 1
    - Activity on next calendar day: streak += 1
    - Activity on same calendar day: streak unchanged
    - Missed day (different calendar day): streak = 1
    """

    @staticmethod
    def calculate_streak(last_active_date: date, current_date: date) -> int:
        """Calculate new streak based on last activity and current date.

        Args:
            last_active_date: The date the user was last active
            current_date: The current date

        Returns:
            The updated streak count
        """
        if last_active_date is None:
            return 1

        if current_date == last_active_date:
            # Same day - streak unchanged
            return 1  # This will be the existing streak preserved by caller

        if (current_date - last_active_date).days == 1:
            # Next day - increment
            return 1  # Caller adds 1 to existing streak

        # Missed day - reset to 1
        return 1

    @staticmethod
    def should_increment_streak(last_active_date: date, current_date: date) -> bool:
        """Whether the streak should be incremented.

        Returns True if current day is exactly next day after last active.
        """
        if last_active_date is None:
            return True

        if current_date == last_active_date:
            return False  # Same day, no increment

        return (current_date - last_active_date).days == 1