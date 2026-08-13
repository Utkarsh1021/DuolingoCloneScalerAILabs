# API.md

## Base URL
`http://127.0.0.1:8000` (development) or deployed endpoint

## Authentication
Simplified: `GET /api/me` returns seeded user ID = 1. No JWT or OAuth.

## Endpoints

### User

`GET /api/user`
- Response: User profile with xp, streak, hearts, gems, daily_goal, achievements

`POST /api/user/reset-streak`
- Reset user streak (for testing)
- Response: `{"message": "Streak reset"}`

### Path

`GET /api/path`
- Response: Learning path with units and skills
- Each unit has skills with status (locked/available/completed) and progress

### Lessons

`POST /api/lessons/{lessonId}/start`
- Start a lesson
- Response: lesson state with exercises, hearts, xp

`POST /api/lessons/{lessonId}/answer`
- Process answer to exercise
- Request: `{"exercise_id": int, "answer": string}`
- Response: `{correct, correct_answer, xp_earned, hearts_remaining, hearts_lost, message}`

`POST /api/lessons/{lessonId}/complete`
- Complete a lesson
- Response: `{completed, xp_earned, total_xp, streak, skill_progress, skill_completed, hearts_lost, message, unlocked_skill}`

### Leaderboard

`GET /api/leaderboard`
- Response: Leaderboard entries with rank, name, xp, streak

## Response Models

### User
```json
{
  "id": 1,
  "name": "Utkarsh",
  "xp": 840,
  "streak": 12,
  "hearts": 5,
  "gems": 120,
  "daily_goal": 20,
  "last_active_date": "2024-01-15T10:30:00Z",
  "total_skills_completed": 6,
  "achievements_count": 4
}
```

### Skill Progress
```json
{
  "id": 1,
  "title": "Greetings",
  "status": "completed",
  "progress": 100,
  "crowns": 3
}
```

### Lesson Complete
```json
{
  "completed": true,
  "xp_earned": 10,
  "total_xp": 860,
  "streak": 13,
  "skill_progress": 100,
  "skill_completed": true,
  "hearts_lost": 0,
  "message": "Lesson complete!",
  "unlocked_skill": "Family"
}
```

### Leaderboard Entry
```json
{
  "rank": 1,
  "name": "Alex",
  "xp": 1240,
  "streak": 15,
  "avatar": "🧑"
}
```