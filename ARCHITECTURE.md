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
- **Tailwind CSS** for utility-first styling
- **DaisyUI** component library for reusable UI

### Key Directories

| Directory | Purpose |
|---|---|
| `frontend/components/layout/` | Sidebar, TopBar navigation |
| `frontend/components/path/` | Skill tree / learning path visualization |
| `frontend/components/lesson/` | `LessonPlayer.tsx` – core lesson loop |
| `frontend/components/gamification/` | XP, streaks, hearts displays |
| `frontend/components/ui/` | Reusable primitives (buttons, modals, toasts) |
| `frontend/hooks/` | `useLesson.ts`, `useUserProgress.ts` – React hooks |
| `frontend/lib/api.ts` | Type-safe API client |
| `frontend/lib/types.ts` | Shared TypeScript types |
| `frontend/lib/utils.ts` | Utility functions |

### Lesson Player State Machine

The lesson player follows a strict state machine:

| State | Description |
|---|---|
| `IDLE` | No lesson active |
| `LOADING` | Fetching lesson data from API |
| `ACTIVE` | User is answering exercises |
| `FEEDBACK` | Showing correct/incorrect feedback |
| `CORRECT` / `WRONG` | Feedback resolved, awaiting next action |
| `NEXT` / `COMPLETE` | Lesson finished, progress updated |

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
| `type_answer` | Type the full answer |

- **`ExerciseRenderer`** component switches on `exercise.type` to render the appropriate UI
- Backend-validates answers (authoritative validation), not just frontend checks

### API Client (`frontend/lib/api.ts`)

- Type-fetched responses from backend OpenAPI specs
- Automatic JSON serialization/deserialization
- Error handling for 4xx/5xx responses

### React Hooks

- **`useLesson.ts`** – manages lesson state, exercise progression, feedback handling
- **`useUserProgress.ts`** – fetches and caches user profile, streak, hearts, XP, achievements

## Backend Architecture

### Framework & ORM

- **FastAPI** with Python 3.10
- **SQLAlchemy 2.x** ORM with SQLite database
- Automatic OpenAPI documentation

### Project Structure (`backend/app/`)

| File/Directory | Purpose |
|---|---|
| `main.py` | FastAPI app initialization, startup seeding |
| `config.py` | Application configuration (CORS origins, settings) |
| `db/` | Database session management, seeding |
| `models/` | SQLAlchemy model definitions |
| `api/` | Route handlers (`path.py`, `users.py`) |
| `services/` | Business logic (`heart_service.py`, `lesson_service.py`, `streak_service.py`) |
| `schemas/` | Pydantic response models |

### Services

- **`heart_service.py`** – lazy heart regeneration (1 every 30 min, max 5), calculates hearts on state request
- **`lesson_service.py`** – lesson start/answer/complete logic, exercise validation, XP calculation
- **`streak_service.py`** – deterministic streak calculation based on `last_active_date`

### API Design

- **Resource-oriented endpoints**
- **Backend-authoritative answer validation** – frontend sends answer, backend validates against `correct_answer`
- **Predictable response schemas** matching types in `API.md`

| Endpoint | Description |
|---|---|
| `GET /api/user` | User profile (xp, streak, hearts, gems, daily_goal, achievements) |
| `POST /api/user/reset-streak` | Reset streak (testing) |
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
- **UserAchievement** – `id`, `user_id`, `title`, `description`, `earned_at`

## Database Schema

### Hierarchy

```
Course (1) → many Units
Unit (1) → many Skills
Skill (1) → many Lessons
Lesson (1) → many Exercises
User (1) → many UserSkillProgress
User (1) → many UserAchievement
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
- **3 units**: Basics, Greetings, Food
- **5 skills**: Greetings, Family, Numbers, Common Phrases (plus Food-related)
- **9 lessons** across skills
- **~60 exercises** covering all 5 types
- **1 default user**: "Utkarsh", 0 XP, 0 streak, 5 hearts, 120 gems

## Gamification Systems

### Hearts System

- **Max hearts**: 5
- **Wrong answer**: -1 heart
- **Regeneration**: 1 heart every 30 minutes, **lazy calculated** on state request (no background job)
- **Update both UI and database consistently** on each state request
- When hearts reach 0: show "Out of Hearts" modal

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

- Milestone-based: total skills completed, streaks, lessons completed, etc.
- Stored in `UserAchievement` model with `earned_at` timestamp

## Data Flow

### Lesson Start Flow

1. User clicks "Start Lesson" from skill tree
2. `POST /api/lessons/{lessonId}/start` – backend returns lesson state (exercises, hearts, xp)
3. Frontend initializes `LessonPlayer` component in `ACTIVE` state
4. First exercise rendered via `ExerciseRenderer`

### Answer Processing Flow

1. User submits answer to current exercise
2. `POST /api/lessons/{lessonId}/answer` with `{ exercise_id, answer }`
3. Backend validates answer against `correct_answer` (authoritative)
4. Response: `{ correct, correct_answer, xp_earned, hearts_remaining, hearts_lost, message }`
5. Frontend updates state: if correct → next exercise; if wrong → lose heart, show feedback
6. If hearts reach 0, lesson ends with "Out of Hearts" modal

### Lesson Complete Flow

1. All exercises answered (or hearts depleted)
2. `POST /api/lessons/{lessonId}/complete`
3. Backend calculates final XP, skill progress, achievements
4. Response: `{ completed, xp_earned, total_xp, streak, skill_progress, skill_completed, hearts_lost, message, unlocked_skill }`
5. Frontend updates user profile, shows lesson complete modal, navigates back to skill tree

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
| **SQLite for development, cloud-ready** | Zero-config local dev, expect persistent storage on deployment |