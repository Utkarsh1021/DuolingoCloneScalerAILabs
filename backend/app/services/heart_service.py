"""Heart service - heart regeneration and deduction."""

from datetime import datetime, timedelta


class HeartService:
    """Manages hearts system with lazy regeneration.

    Heart rules:
    - Max hearts: 5
    - Regeneration: 1 heart every 30 minutes
    - Wrong answer: -1 heart
    - Lazy regeneration: calculated on state request, not background job
    """

    HEART_REGEN_SECONDS = 30 * 60  # 30 minutes

    @staticmethod
    def calculate_hearts_regenerated(
        last_heart_regeneration: datetime,
        current_time: datetime,
        current_hearts: int,
        max_hearts: int = 5,
    ) -> int:
        """Calculate how many hearts should be regenerated.

        Args:
            last_heart_regeneration: When hearts were last regenerated
            current_time: Current time
            current_hearts: Current heart count
            max_hearts: Maximum hearts allowed

        Returns:
            Number of hearts to add (0 or 1 typically)
        """
        if last_heart_regeneration is None:
            return 0

        elapsed = current_time - last_heart_regeneration
        regenerated = int(elapsed.total_seconds() // HeartService.HEART_REGEN_SECONDS)

        # Cap at max possible (1 at a time for simplicity, but could be more)
        regenerated = min(regenerated, max_hearts - current_hearts)

        return regenerated

    @staticmethod
    def deduct_heart(current_hearts: int, max_hearts: int = 5) -> int:
        """Deduct one heart. Returns new heart count.

        Returns 0 if already at 0.
        """
        return max(0, current_hearts - 1)

    @staticmethod
    def regenerate_hearts(
        last_heart_regeneration: datetime,
        current_time: datetime,
        current_hearts: int,
        max_hearts: int = 5,
    ) -> tuple[int, datetime]:
        """Regenerate hearts and return updated hearts and last regeneration time.

        Returns (new_hearts, new_last_regeneration_time).
        If regeneration occurred, last_regeneration is updated to current_time.
        """
        regenerated = HeartService.calculate_hearts_regenerated(
            last_heart_regeneration, current_time, current_hearts, max_hearts
        )

        new_hearts = min(max_hearts, current_hearts + regenerated)

        # If we regenerated, update the last regeneration time
        if regenerated > 0:
            # Keep the original last regeneration time if we want to track intervals,
            # but for simplicity, update to now so next regen starts from now
            new_last = current_time
        else:
            new_last = last_heart_regeneration

        return new_hearts, new_last