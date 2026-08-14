# ARCHITECTURE.md

## Overview

The Duolingo Clone implements a full-stack language learning application with a three-layer architecture:

- **Frontend** (Next.js 16 + TypeScript + Tailwind CSS) – UI, user interactions, exercise rendering
- **Backend** (FastAPI + Python 3.10) – business logic, API, database operations via SQLAlchemy ORM
- **Database** (SQLite) – all persistent data: courses, units, skills, lessons, exercises, user progress

## System Architecture

```text
Frontend (Next.js 16)
    │
    ▼
API Client (fetch → /api routes)
    │
    ▼
Backend (FastAPI)
    │
    ▼
Database (SQLite via SQLAlchemy ORM)
```

## Frontend Architecture

### Framework & Styling

- **Next.js 16** with App Router (`frontend/app/`)
- **TypeScript** for type safety across all components
- **Tailwind CSS** for utility-first styling (custom components only, no external UI kit)

### Key Directories

| Directory | Purpose |
|---|---|
| `frontend/app/(main)/` | Sidebar-layout pages: `learn/`, `profile/`, `leaderboard/`, `settings/`, landing `page.tsx` |
| `frontend/app/lesson/[lessonId]/` | Lesson player page (own layout, no sidebar) |
| `frontend/components/layout/` | `Sidebar`, `TopBar` navigation |
| `frontend/components/lesson/` | `ExerciseRenderer` + per-type renderers (`MultipleChoice`, `WordBank`, `MatchPairs`, `FillBlank`, `TypeAnswer`, `types.ts`) |
| `frontend/components/ui/` | Reusable primitives (`Modal`, `Toast`, `Confetti`) |
| `frontend/components/icon.tsx` | SVG icon set |
| `frontend/hooks/` | `useLesson.ts`, `useUserProgress.ts` – React hooks |
| `frontend/lib/api.ts` | Type-safe API client (proxied via `/api/*`) |
| `frontend/lib/types.ts` | Shared TypeScript types + `XP_VALUES` |
| `frontend/lib/sounds.ts` | Procedural Web Audio correct/wrong sound effects |

### Lesson Player State Machine

The lesson player in `frontend/hooks/useLesson.ts` tracks a `runtime` object whose `status` field drives the UI:

| State | Description |
|---|---|
| `idle` | No lesson active |
| `active` | User is answering exercises |
| `completed` | All exercises answered correctly, lesson finished |
| `out_of_hearts` | Hearts depleted, lesson failed |

State transitions prevent boolean variable mess and ensure proper flow control.

### Exercise System

- **Generic exercise model** with `type` discriminator
- **5 exercise types** supported:

| Type | Description |
|---|---|
| `multiple_choice` | Select correct answer from options |
| `word_bank` | Fill in the blank with word bank |
| `match_pairs` | Match pairs of items |
| `fill_blank` | Type the answer into a blank |
| `type_answer` | Type the full answer (with optional text-to-speech button) |

- **`ExerciseRenderer`** component switches on `exercise.type` to render the appropriate UI
- Backend-validates answers (authoritative validation), not just frontend checks

### Sound Effects (`frontend/lib/sounds.ts`)

- Procedural **Web Audio API** tones – no audio files required
- `playCorrectSound()` – ascending ding; `playWrongSound()` – descending "wah"
- `initAudio()` unlocks/resumes the AudioContext on user gesture (browser autoplay policy)
- Wired into the lesson page effect on the latest answer result

### API Client (`frontend/lib/api.ts`)

- `fetch`-based client hitting relative `/api/*` paths (rewritten to the backend by `next.config.ts`)
- Response shapes mirror the TypeScript types in `lib/types.ts`
- Error handling for non-OK responses

### React Hooks

- **`useLesson.ts`** – manages lesson runtime state, exercise progression, feedback handling, completion, retry, and heart refill
- **`useUserProgress.ts`** – fetches and caches user profile, XP, streak, hearts, gems, and learning path

## Backend Architecture

### Framework & ORM

- **FastAPI** with Python 3.10
- **SQLAlchemy 2.x** ORM with SQLite database
- Automatic OpenAPI documentation

### Project Structure (`backend/app/`)

| File/Directory | Purpose |
|---|---|
| `main.py` | FastAPI app initialization, startup seeding |
| `config.py` | Application configuration (CORS origins, XP/gems/hearts settings) |
| `db/` | Database session management (with commit/rollback), seeding |
| `models/` | SQLAlchemy model definitions |
| `api/` | Route handlers (`path.py`, `users.py`, `lessons.py`, `leaderboard.py`) |
| `services/` | Business logic (`heart_service.py`, `lesson_service.py`, `streak_service.py`, `achievement_service.py`) |
| `schemas/` | Pydantic response models |

### Services

- **`heart_service.py`** – lazy heart regeneration (1 every 30 min, max 5), calculates hearts on state request
- **`lesson_service.py`** – lesson start/answer/complete logic, exercise validation, XP calculation, streak + daily activity updates
- **`streak_service.py`** – deterministic streak calculation based on `last_active_date`
- **`achievement_service.py`** – evaluates and grants milestone achievements

### API Design

- **Resource-oriented endpoints**
- **Backend-authoritative answer validation** – frontend sends answer, backend validates against `correct_answer`
- **Predictable response schemas** matching types in `API.md`

| Endpoint | Description |
|---|---|
| `GET /api/user` | User profile (xp, streak, hearts, gems, daily_goal, achievements) |
| `POST /api/me/reset-streak` | Reset streak (testing) |
| `POST /api/me/refill-hearts` | Refill hearts for gems (`REFILL_GEM_COST`) |
| `GET /api/path` | Learning path with units and skills |
| `POST /api/lessons/{lessonId}/start` | Start a lesson |
| `POST /api/lessons/{lessonId}/answer` | Process answer to exercise |
| `POST /api/lessons/{lessonId}/complete` | Complete a lesson |
| `GET /api/leaderboard` | Leaderboard entries |

### Models (SQLAlchemy)

Key models from `backend/app/models/`:

- **Course** – `id`, `name`, `language`, `description`, `order_index`
- **Unit** – `id`, `course_id`, `title`, `description`, `order_index`
- **Skill** – `id`, `unit_id`, `title`, `description`, `order_index`, `required_skill_id` (self-FK)
- **Lesson** – `id`, `skill_id`, `title`, `description`, `order_index`, `xp_reward`
- **Exercise** – `id`, `lesson_id`, `type`, `question`, `correct_answer`, `data` (JSON), `order_index`
- **User** – `id`, `name`, `email`, `avatar`, `xp`, `streak`, `hearts`, `gems`, `daily_goal`, `last_active_date`
- **UserSkillProgress** – `id`, `user_id`, `skill_id`, `progress` (0-100), `crowns`, `completed`, `updated_at`
- **UserAchievement** – `id`, `user_id`, `achievement_id`, `earned_at`
- **UserDailyActivity** – `id`, `user_id`, `activity_date` (date, not datetime), `exercises_completed`, `correct_answers`, `hearts_lost`, `xp_earned`, `streak_before`, `streak_after`, `created_at`

## Database Schema

### Hierarchy

```
Course (1) → many Units
Unit (1) → many Skills
Skill (1) → many Lessons
Lesson (1) → many Exercises
User (1) → many UserSkillProgress
User (1) → many UserAchievement
User (1) → many UserDailyActivity
UserAchievement → Achievement (via achievement_id)
```

### Key Relationships

- **Course → Unit**: `course_id`, `ondelete="CASCADE"`
- **Unit → Skill**: `unit_id`, `ondelete="CASCADE"`
- **Skill → Lesson**: `skill_id`, `ondelete="CASCADE"`
- **Lesson → Exercise**: `lesson_id`, `ondelete="CASCADE"`
- **User → UserSkillProgress**: `user_id`, `user_id`, `ondelete="CASCADE"`
- **User → UserAchievement**: `user_id`, `ondelete="CASCADE"`
- **Skill → Skill** (self): `required_skill_id` (nullable, for prerequisite ordering)

### Seed Data

Pre-seeded on startup (`backend/app/db/seed_database()`):

- **1 course**: Spanish
- **3 units**: Basics (empty, hidden), Greetings, Food
- **5 skills**: Greetings (3 lessons), Family (1 lesson, unlocks after Greetings), Food (2 lessons), Numbers + Common Phrases (locked, no lessons yet)
- **6 lessons** across 3 skills
- **16 exercises** covering all 5 types
- **4 achievements**: First Lesson, 7 Day Streak, XP Hunter, Perfect Lesson
- **1 default user**: "Utkarsh", 0 XP, 0 streak, 5 hearts, 1000 gems
- **7 leaderboard rivals**: Emma, Liam, Olivia, Noah, Ava, Mia, Lucas

## Gamification Systems

### Hearts System

- **Max hearts**: 5
- **Wrong answer**: -1 heart
- **Regeneration**: 1 heart every 30 minutes, **lazy calculated** on state request (no background job)
- **Update both UI and database consistently** on each state request
- When hearts reach 0: show "Out of Hearts" modal
- **Refill**: `POST /api/me/refill-hearts` restores 5 hearts for `REFILL_GEM_COST` (350) gems

### Streak Logic

- **Deterministic** based on calendar dates from `last_active_date`
- **First activity**: streak = 1
- **Next calendar day**: streak += 1
- **Same calendar day**: streak unchanged
- **Missed day**: streak = 1

### XP System

| Action | XP |
|---|---|
| Correct answer | +5 XP |
| Lesson completion | +10 XP |
| Perfect lesson bonus | +5 XP (when no hearts lost during lesson) |

### Achievements

- Milestone-based: First Lesson, 7 Day Streak, XP Hunter, Perfect Lesson
- Stored in `UserAchievement` model with `earned_at` timestamp
- User profile returns `earned_achievement_ids` (mapped through `UserAchievement.achievement_id`) so the profile page can light up only genuinely-earned badges
- Lesson-complete modal shows the newly earned achievement chips

### Daily Activity & XP Today

- `complete_lesson` writes/updates a `UserDailyActivity` row for the current calendar date (`activity_date` is a **date** column)
- `xp_earned` accumulates there, feeding the `xp_today` figure shown in the profile/topbar
- Streak, daily goal, and XP-today figures all derive from persisted rows

## Data Flow

### Lesson Start Flow

1. User clicks "Start" on the current skill from the learning path road
2. `POST /api/lessons/{lessonId}/start` – backend returns lesson state (exercises, hearts, xp)
3. Frontend routes to `/lesson/{lessonId}` and initializes the lesson runtime (`active`)
4. First exercise rendered via `ExerciseRenderer`

### Answer Processing Flow

1. User submits answer to current exercise
2. `POST /api/lessons/{lessonId}/answer` with `{ exercise_id, answer }`
3. Backend validates answer against `correct_answer` (authoritative)
4. Response: `{ correct, correct_answer, xp_earned, hearts_remaining, message }`
5. Frontend plays correct/wrong sound, updates runtime: if correct → next exercise; if wrong → lose heart + shake + feedback
6. If hearts reach 0, lesson ends with "Out of Hearts" modal

### Lesson Complete Flow

1. All exercises answered (or hearts depleted)
2. `POST /api/lessons/{lessonId}/complete`
3. Backend calculates final XP, skill progress, achievements, streak + daily activity
4. Response: `{ completed, xp_earned, total_xp, streak, skill_progress, skill_completed, hearts_lost, message, unlocked_skill, earned_achievements }`
5. Frontend updates user profile, plays XP toast, shows lesson complete modal (with earned achievement chips), navigates back to the road

## API Client (TypeScript Types)

Types defined in `frontend/lib/types.ts` mirror the backend Pydantic models and API response schemas, ensuring type safety across the full stack.

## Design Decisions Summary

| Decision | Rationale |
|---|---|
| **FastAPI + SQLAlchemy** | Modern Python features, auto-doc, robust ORM, SQLite simplicity |
| **Lazy heart regeneration** | No background jobs needed; calculated on state request |
| **Deterministic streak** | Based on calendar dates, no timezone ambiguity |
| **Backend-authoritative validation** | Prevents answer manipulation from client |
| **5 exercise types** | Covers core Duolingo interaction patterns |
| **Type-safe full stack** | Shared types between FastAPI Pydantic and TypeScript |
| **Procedural Web Audio sounds** | No audio assets; plays distinct correct/wrong feedback |
| **Earned achievement IDs in profile API** | Lets the profile page highlight only genuinely earned badges (fixed wrong positional unlock) |
| **SQLite for development, cloud-ready** | Zero-config local dev, expect persistent storage on deployment |