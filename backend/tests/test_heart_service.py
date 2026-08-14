"""Tests for the heart service."""

from datetime import datetime, timedelta

from app.services.heart_service import HeartService


def test_deduct_heart():
    assert HeartService.deduct_heart(5) == 4
    assert HeartService.deduct_heart(1) == 0


def test_deduct_heart_floors_at_zero():
    assert HeartService.deduct_heart(0) == 0


def test_no_regen_under_thirty_minutes():
    now = datetime(2026, 8, 14, 12, 0, 0)
    last = now - timedelta(minutes=29)
    assert HeartService.calculate_hearts_regenerated(last, now, 4) == 0


def test_regen_one_heart_after_thirty_minutes():
    now = datetime(2026, 8, 14, 12, 0, 0)
    last = now - timedelta(minutes=30)
    assert HeartService.calculate_hearts_regenerated(last, now, 4) == 1


def test_regen_capped_at_max_hearts():
    now = datetime(2026, 8, 14, 12, 0, 0)
    last = now - timedelta(hours=3)
    assert HeartService.calculate_hearts_regenerated(last, now, 4, 5) == 1  # cap 5-4


def test_regenerate_hearts_returns_new_last():
    now = datetime(2026, 8, 14, 12, 0, 0)
    last = now - timedelta(hours=1)
    new_hearts, new_last = HeartService.regenerate_hearts(last, now, 4)
    assert new_hearts == 5
    assert new_last == now


def test_no_regeneration_keeps_state():
    now = datetime(2026, 8, 14, 12, 0, 0)
    last = now - timedelta(minutes=10)
    new_hearts, new_last = HeartService.regenerate_hearts(last, now, 4)
    assert new_hearts == 4
    assert new_last == last