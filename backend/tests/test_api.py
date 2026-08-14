"""End-to-end API tests against a seeded in-memory database."""

import app.db as db_module


def test_path_returns_units_with_skills(seeded_client):
    res = seeded_client.get("/api/path")
    assert res.status_code == 200
    units = res.json()
    # Empty "Basics" unit is filtered out
    assert len(units) >= 2
    for unit in units:
        assert "skills" in unit
        assert unit["skills"], "units should not be empty"
    first_skill = units[0]["skills"][0]
    assert "status" in first_skill
    assert "first_lesson_id" in first_skill


def test_get_me_returns_default_user(seeded_client):
    res = seeded_client.get("/api/user")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Utkarsh"
    assert "xp_today" in data
    assert "streak" in data
    assert "hearts" in data


def test_leaderboard_consistent_streak(seeded_client):
    me = seeded_client.get("/api/user").json()
    lb = seeded_client.get("/api/leaderboard").json()
    my_row = next(r for r in lb if r["name"] == "Utkarsh")
    assert my_row["streak"] == me["streak"]


def test_lesson_answer_persists_xp(seeded_client):
    start = seeded_client.post("/api/lessons/1/start").json()
    exercises = start["exercises"]
    assert exercises, "lesson should have exercises"
    ex = exercises[0]
    correct = ex["correct_answer"]
    res = seeded_client.post(
        f"/api/lessons/1/answer",
        json={"exercise_id": ex["id"], "answer": correct},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["correct"] is True
    assert body["xp_earned"] > 0

    # XP must persist across a fresh session (this is the core bug fix)
    db = db_module.SessionLocal()
    try:
        from app.models.user import User

        user = db.query(User).order_by(User.id).first()
        assert user.xp >= body["xp_earned"]
        assert user.streak >= 1  # first-ever activity starts the streak
    finally:
        db.close()


def test_lesson_complete_awards_achievement(seeded_client):
    start = seeded_client.post("/api/lessons/1/start").json()
    for ex in start["exercises"]:
        answer = ex["correct_answer"] or "matched"
        seeded_client.post(
            "/api/lessons/1/answer",
            json={"exercise_id": ex["id"], "answer": answer},
        )
    res = seeded_client.post("/api/lessons/1/complete")
    assert res.status_code == 200
    body = res.json()
    assert body["completed"] is True
    assert body["skill_progress"] == 100
    assert body["skill_completed"] is True
    assert "earned_achievements" in body


def test_refill_full_hearts_is_noop(seeded_client):
    me = seeded_client.get("/api/user").json()
    res = seeded_client.post("/api/me/refill-hearts")
    assert res.status_code == 200
    assert res.json()["hearts"] == 5


def test_refill_reduces_gems_and_restores_hearts(seeded_client):
    # Lose a heart first
    start = seeded_client.post("/api/lessons/1/start").json()
    ex = start["exercises"][0]
    res = seeded_client.post(
        "/api/lessons/1/answer",
        json={"exercise_id": ex["id"], "answer": "definitely-wrong"},
    )
    assert res.status_code == 200
    assert res.json()["hearts_remaining"] == 4

    before = seeded_client.get("/api/user").json()
    assert before["hearts"] == 4

    refill = seeded_client.post("/api/me/refill-hearts").json()
    assert refill["ok"] is True
    assert refill["hearts"] == 5
    assert refill["gems"] == before["gems"] - 350


def test_insufficient_gems_blocked(seeded_client):
    # Lose a heart so the refill doesn't short-circuit on "already full"
    start = seeded_client.post("/api/lessons/1/start").json()
    ex = start["exercises"][0]
    seeded_client.post(
        "/api/lessons/1/answer",
        json={"exercise_id": ex["id"], "answer": "definitely-wrong"},
    )

    from app.models.user import User

    db = db_module.SessionLocal()
    try:
        user = db.query(User).order_by(User.id).first()
        user.gems = 0
        db.commit()
    finally:
        db.close()

    res = seeded_client.post("/api/me/refill-hearts")
    assert res.status_code == 400