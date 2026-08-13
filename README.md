# Duolingo Clone

A functional clone of the Duolingo web application that replicates Duolingo's design, user experience, and core lesson and gamification workflows.

## Demo

[Live Demo Link](https://your-deployed-app.vercel.app)

## Features

### Learning Path / Skill Tree

- Visual path/tree of units and skills with lock/unlock progression
- Completed vs available vs locked states
- Progress rings/crowns per skill
- Top bar showing streak, XP, hearts, and gems

### Lesson Player (Core Loop)

- Multiple exercise types: multiple choice, translate (word bank), match pairs, fill in the blank, and type-the-answer
- Immediate correct/incorrect feedback with signature feedback bar
- Progress bar across the lesson
- Hearts system: lose one on wrong answer; lesson end/failure handled
- XP award and skill progress tracking on completion

### Gamification & Progress

- Streak counter that increments on daily activity
- XP totals with consistent calculation
- Hearts regeneration over time (1 heart every 30 minutes)
- Daily goal / XP goal indicator
- All progress persists per user in database

### Content Management

- Course content (units, skills, lessons, exercises) stored in database and seeded
- Learner profile page with stats (streak, total XP, achievements)
- All learner progress persists per user

### Duolingo Experience

- Playful, colorful, gamified UI with mascot-style flourishes
- The lesson player with animated feedback
- Modals (lesson complete, out of hearts), toasts, and celebratory states
- Path navigation and progress visuals
- Settings placeholders

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript, Tailwind CSS
- **Backend**: FastAPI with Python 3.10
- **Database**: SQLite
- **UI Components**: DaisyUI, custom components

## Architecture

```text
Frontend (Next.js)
    │
    ▼
API Client (fetch to FastAPI)
    │
    ▼
Backend (FastAPI)
    │
    ▼
Database (SQLite)
```

### Database Schema

#### Course Model

```text
Course
  id: INTEGER (PK)
  name: TEXT
  language: TEXT (default: "Spanish")
  description: TEXT (nullable)
  order_index: INTEGER (default: 0)
```

#### Unit Model

```text
Unit
  id: INTEGER (PK)
  course_id: INTEGER (FK -> Course.id, ondelete="CASCADE")
  title: TEXT
  description: TEXT (nullable)
  order_index: INTEGER (default: 0)
```

#### Skill Model

```text
Skill
  id: INTEGER (PK)
  unit_id: INTEGER (FK -> Unit.id, ondelete="CASCADE")
  title: TEXT
  description: TEXT (nullable)
  order_index: INTEGER (default: 0)
  required_skill_id: INTEGER (FK -> Skill.id, nullable=True)
```

#### Lesson Model

```text
Lesson
  id: INTEGER (PK)
  skill_id: INTEGER (FK -> Skill.id, ondelete="CASCADE")
  title: TEXT
  description: TEXT (nullable)
  order_index: INTEGER (default: 0)
  xp_reward: INTEGER (default: 10)
```

#### Exercise Model

```text
Exercise
  id: INTEGER (PK)
  lesson_id: INTEGER (FK -> Lesson.id, ondelete="CASCADE")
  type: TEXT ("multiple_choice" | "word_bank" | "match_pairs" | "fill_blank" | "type_answer")
  question: TEXT (not null)
  correct_answer: TEXT (not null)
  data: TEXT (nullable, JSON)
  order_index: INTEGER (default: 0)
```

#### User Model

```text
User
  id: INTEGER (PK)
  name: TEXT (not null)
  email: TEXT (unique, not null)
  avatar: TEXT (nullable)
  xp: INTEGER (default: 0)
  streak: INTEGER (default: 0)
  hearts: INTEGER (default: 5)
  gems: INTEGER (default: 120)
  daily_goal: INTEGER (default: 20)
  last_active_date: DATETIME (timezone-aware)
  created_at: DATETIME (timezone-aware, default: func.now())
```

#### UserSkillProgress Model

```text
UserSkillProgress
  id: INTEGER (PK)
  user_id: INTEGER (FK -> User.id, ondelete="CASCADE")
  skill_id: INTEGER (FK -> Skill.id, ondelete="CASCADE")
  progress: INTEGER (0-100, default: 0)
  crowns: INTEGER (default: 0)
  completed: BOOLEAN (default: False)
  updated_at: DATETIME (timezone-aware, default: func.now(), onupdate: func.now())
```

#### UserAchievement Model

```text
UserAchievement
  id: INTEGER (PK)
  user_id: INTEGER (FK -> User.id, ondelete="CASCADE")
  title: TEXT (not null)
  description: TEXT (nullable)
  earned_at: DATETIME (timezone-aware, default: func.now())
```

### API Overview

#### User Endpoints

- `GET /api/user` - Get current user profile
- `POST /api/user/reset-streak` - Reset user streak (testing)

#### Path Endpoints

- `GET /api/path` - Get the learning path with units and skills

#### Lesson Endpoints

- `POST /api/lessons/{lessonId}/start` - Start a lesson
- `POST /api/lessons/{lessonId}/answer` - Process answer to exercise
- `POST /api/lessons/{lessonId}/complete` - Complete a lesson

#### Leaderboard

- `GET /api/leaderboard` - Get leaderboard entries

### Seed Data

The application comes pre-seeded with:

- **1 course**: Spanish
- **3 units**: Basics, Greetings, Food
- **5 skills**: Greetings (in Unit 2), Food (in Unit 3), Family (unlocks after Greetings), Numbers (unlocks after Family), Common Phrases
- **9 lessons** across the skills
- **~60 exercises** covering all 5 exercise types
- **1 default user**: "Utkarsh" with 0 XP, 0 streak, 5 hearts, 120 gems

### Design Decisions

1. **Heart Regeneration**: Lazy regeneration calculated on state request, not background job. 1 heart every 30 minutes, max 5 hearts.

2. **Streak Logic**: Deterministic streak calculation based on last_active_date:
   - First activity: streak = 1
   - Activity on next calendar day: streak += 1
   - Activity on same calendar day: streak unchanged
   - Missed day: streak = 1

3. **XP System**:
   - Correct answer: +5 XP
   - Lesson completion: +10 XP
   - Perfect lesson bonus: +5 XP (when no hearts lost)

4. **Answer Validation**: Backend-authoritative - the frontend sends the answer, the backend validates it against the correct_answer stored in the database.

5. **Hearts System**:
   - Max hearts: 5
   - Wrong answer: -1 heart
   - If hearts reach 0: show "Out of Hearts" modal
   - Regeneration: 1 heart every 30 minutes, calculated lazily

### Local Setup

```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables

No environment variables are required for basic operation. The backend uses SQLite by default with a database file `duolingo.db` in the backend directory.

### Deployment

Deploy the frontend to Vercel or Netlify, and the backend to Render, Railway, or any Python-capable cloud service.

**Important**: SQLite on some cloud platforms can be ephemeral unless you configure persistent storage. For this assignment, seed the DB on deployment and make the persistence expectation clear.

### Assumptions

- Real user authentication is simplified (assume a default logged-in learner)
- Real speech recognition/pronunciation exercises are placeholders
- In-app purchases/Super subscription are mocked
- Multiple languages are not supported (one seeded language is enough)
- Friends/social features are placeholders (seeded leaderboard only)

### Code Quality

- Clean, readable, and well-organized code
- Proper separation of concerns between frontend and backend
- Reusable exercise engine with type-based rendering
- Deterministic business logic (streak, hearts, XP)
- Database schema with proper relationships

### Project Structure

```text
backend/
  app/
    main.py          # FastAPI app with startup seeding
    db/              # Database session and seeding
    config.py        # Application configuration
    models/          # SQLAlchemy models (base.py, course.py, user.py, skill.py, unit.py, lesson.py, exercise.py)
    api/             # API routes (path.py, users.py)
    services/        # Business logic (heart_service.py, lesson_service.py, streak_service.py)
    db/              # Database initialization
    tests/           # Tests
  requirements.txt
  README.md

frontend/
  app/               # Next.js app router
    layout.tsx
    page.tsx
    learn/
      page.tsx
    lesson/
      [lessonId]/
        page.tsx
    profile/
      page.tsx
    leaderboard/
      page.tsx
    globals.css
  components/
    layout/          # Sidebar, TopBar
    path/            # Skill tree components
    lesson/          # Lesson player and exercise components
    gamification/    # XP, streaks, hearts displays
    ui/              # Reusable UI components
  lib/
    api.ts           # API client
    types.ts         # Type definitions
    utils.ts         # Utility functions
  hooks/
    useUserProgress.ts    # User progress hook
    useLesson.ts          # Lesson state hook
  package.json
  tailwind.config.cjs
  package-lock.json
```

## Evaluation Criteria

### Functionality

- All core features working correctly, including the lesson loop and gamification (XP, streak, hearts)
- Lesson navigation from home path to skill to lesson to exercises
- Progress persistence per user

### UI/UX

- Visual similarity to the original Duolingo app's design
- Playful, colorful, gamified interface
- The lesson player with animated feedback
- Modals, toasts, and celebratory states
- Path navigation and progress visuals

### Database Design

- Well-structured schema with proper relationships
- Course -> Unit -> Skill -> Lesson -> Exercise hierarchy
- User-specific progress tracking (UserSkillProgress)
- Achievement system

### Backend / API Design

- Clean, sensible API design
- Authoritative answer validation (backend validates, not frontend)
- Resource-oriented endpoints

### Code Quality

- Clean, readable, and well-organized code
- Proper separation of concerns
- Code modularity (reusable ExerciseRenderer component)
- Code understanding (able to explain implementation decisions)

### Code Modularity

- Proper separation of concerns
- Reusable ExerciseRenderer component that switches between 5 exercise types
- Separate services for lesson, progress, streak, and heart management
- Type-safe API client with TypeScript

### Code Understanding

- Able to explain:
  - The lesson state machine (IDLE -> LOADING -> ACTIVE -> FEEDBACK -> CORRECT/WRONG -> NEXT/COMPLETE)
  - The heart regeneration logic (lazy, 30-minute intervals)
  - The streak calculation (deterministic based on dates)
  - The exercise validation flow (frontend sends answer, backend validates)
  - The database schema relationships