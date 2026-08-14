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
    def calculate_streak(
        stored_streak: int,
        last_active_date: date,
        current_date: date,
    ) -> int:
        """Calculate the current streak to display.

        Args:
            stored_streak: The user's persisted streak count
            last_active_date: The date the user was last active
            current_date: The current date

        Returns:
            The streak count to display based on last activity relative to now.
        """
        if last_active_date is None:
            return stored_streak

        if current_date == last_active_date:
            # Active today - streak is at least 1
            return max(stored_streak, 1)

        if (current_date - last_active_date).days == 1:
            # Active yesterday - streak preserved until next activity
            return stored_streak

        # Missed more than a day - streak broken
        return 0

    @staticmethod
    def compute_new_streak(
        stored_streak: int,
        last_active_date: date,
        current_date: date,
    ) -> int:
        """Compute the streak to persist after an activity on `current_date`.

        Rules:
        - First-ever activity: streak = 1
        - Activity on the next calendar day: streak + 1
        - Activity on the same day: streak unchanged (at least 1)
        - Missed day(s) then active again: streak restarts at 1

        Args:
            stored_streak: The user's persisted streak count
            last_active_date: The date the user was last active (None if never)
            current_date: The date of this activity

        Returns:
            The new streak value to store.
        """
        if last_active_date is None:
            return 1

        if current_date == last_active_date:
            return max(stored_streak, 1)

        if (current_date - last_active_date).days == 1:
            return stored_streak + 1

        # Missed one or more days - the streak restarts today.
        return 1