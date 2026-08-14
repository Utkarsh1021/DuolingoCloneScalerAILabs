# API.md

## Base URL
`http://127.0.0.1:8000` (development) or your deployed backend.
The Next.js frontend proxies `/api/*` → the backend via `next.config.ts`, so the frontend calls relative paths.

## Authentication
Simplified: no JWT. The backend uses the first user in the database as the current learner (seeded as "Utkarsh", id 1).

## Endpoints

### User

`GET /api/user`
- Response: user profile with xp, streak, hearts, gems, daily_goal, `xp_today`, `achievements_count`, and `earned_achievement_ids`

`POST /api/me/reset-streak`
- Reset the current user's streak (testing)
- Response: `{"message": "Streak reset"}`

`POST /api/me/refill-hearts`
- Refill hearts to the max (5) in exchange for `REFILL_GEM_COST` gems (350)
- `400` if gems are insufficient; `200` with `already_full: true` when hearts are already full
- Response: `{ok, message, hearts, gems, already_full}`

### Path

`GET /api/path`
- Response: list of units, each with skills and their `status` (locked / available / completed), `progress`, `crowns`, `lessons_count`, `first_lesson_id`
- Units/skills with no lessons are omitted

### Lessons

`POST /api/lessons/{lessonId}/start`
- Start a lesson
- Response: lesson metadata, current runtime state (hearts, xp_earned, status, current_exercise_index) and the full `exercises` list (id, type, question, correct_answer, data, order_index)

`POST /api/lessons/{lessonId}/answer`
- Process answer to one exercise
- Request: `{"exercise_id": int, "answer": string}`
- Response: `{correct, correct_answer, xp_earned, hearts_remaining, message}`

`POST /api/lessons/{lessonId}/complete`
- Complete all exercises in a lesson
- Response: `{completed, xp_earned, total_xp, streak, skill_progress, skill_completed, hearts_lost, message, unlocked_skill, earned_achievements}`

### Leaderboard

`GET /api/leaderboard`
- Response: leaderboard entries with `rank`, `name`, `xp`, `streak`, `avatar`

## Exercise Types

The backend is authoritative. Exercises are serialized with `type` and `data`:

- `multiple_choice` → `data.options: string[]`
- `word_bank` → `data.words: string[]`
- `match_pairs` → `data.pairs: [string, string][]`
- `fill_blank` → `question` contains `______`; optional `data.words` word bank (falls back to free text input)
- `type_answer` → plain text input

## Response Models

### User
```json
{
  "id": 1,
  "name": "Utkarsh",
  "xp": 35,
  "streak": 1,
  "hearts": 5,
  "gems": 650,
  "email": "utkarsh@example.com",
  "avatar": null,
  "daily_goal": 20,
  "last_active_date": "2026-08-14T04:51:47.399194",
  "total_skills_completed": 1,
  "achievements_count": 2,
  "earned_achievement_ids": [1, 4],
  "xp_today": 25
}
```

### Answer
```json
{
  "correct": true,
  "correct_answer": "Hello",
  "xp_earned": 5,
  "hearts_remaining": 5,
  "message": "Correct!"
}
```

### Lesson Complete
```json
{
  "completed": true,
  "xp_earned": 10,
  "total_xp": 35,
  "streak": 1,
  "skill_progress": 100,
  "skill_completed": true,
  "hearts_lost": 0,
  "message": "Lesson complete!",
  "unlocked_skill": "Family",
  "earned_achievements": ["First Lesson"]
}
```

### Leaderboard Entry
```json
{
  "rank": 1,
  "name": "Emma",
  "xp": 2450,
  "streak": 34,
  "avatar": null
}
```