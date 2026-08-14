"""Tests for the streak service."""

from datetime import date, timedelta

from app.services.streak_service import StreakService


def test_first_ever_activity_starts_streak():
    assert StreakService.compute_new_streak(0, None, date(2026, 8, 14)) == 1


def test_same_day_activity_keeps_streak():
    last = date(2026, 8, 14)
    assert StreakService.compute_new_streak(3, last, date(2026, 8, 14)) == 3


def test_same_day_first_activity_is_at_least_one():
    last = date(2026, 8, 14)
    assert StreakService.compute_new_streak(0, last, date(2026, 8, 14)) == 1


def test_next_day_activity_increments():
    last = date(2026, 8, 14)
    assert StreakService.compute_new_streak(3, last, date(2026, 8, 15)) == 4


def test_missed_days_restart_streak():
    last = date(2026, 8, 10)
    assert StreakService.compute_new_streak(5, last, date(2026, 8, 14)) == 1


def test_calculate_streak_active_today():
    assert StreakService.calculate_streak(2, date(2026, 8, 14), date(2026, 8, 14)) == 2


def test_calculate_streak_active_today_zero_becomes_one():
    assert StreakService.calculate_streak(0, date(2026, 8, 14), date(2026, 8, 14)) == 1


def test_calculate_streak_active_yesterday_preserved():
    assert StreakService.calculate_streak(2, date(2026, 8, 13), date(2026, 8, 14)) == 2


def test_calculate_streak_broken_after_missed_days():
    assert StreakService.calculate_streak(2, date(2026, 8, 10), date(2026, 8, 14)) == 0


def test_calculate_streak_never_active():
    assert StreakService.calculate_streak(0, None, date(2026, 8, 14)) == 0