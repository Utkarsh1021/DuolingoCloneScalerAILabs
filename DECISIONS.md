# DECISIONS.md

## Design Decisions

### Backend Framework: FastAPI
Chosen for its modern Python features, automatic documentation, and simple routing. SQLAlchemy 2.x provides robust ORM capabilities.

### Database: SQLite
Selected for simplicity and zero configuration. Designed for local development and deployment with the expectation of persistent storage on cloud platforms.

### Architecture: Frontend-Backend-SQLite
Three-layer architecture with clear separation:
- Frontend (Next.js + TypeScript) handles UI and user interactions
- Backend (FastAPI) handles business logic, API, and database operations
- SQLite stores all persistent data

### Session Management
- Simplified authentication: `GET /api/me` returns seeded user ID = 1
- Heart regeneration calculated lazily on state request, not background job
- Streak logic deterministic based on last_active_date

### Exercise System
- Generic exercise model with type discriminator
- Frontend `ExerciseRenderer` switches on exercise.type
- Backend validates answers against correct_answer stored in database

### Lesson State Machine
- States: IDLE → LOADING → ACTIVE → FEEDBACK → CORRECT/WRONG → NEXT/COMPLETE
- Prevents boolean variable mess and ensures proper state transitions

### Hearts System
- Max hearts: 5
- Wrong answer: -1 heart
- Lazy regeneration: 1 heart every 30 minutes, calculated on state request
- Update both UI and database consistently

### Streak Logic
- Deterministic based on calendar dates
- First activity: streak = 1
- Next day: streak += 1
- Same day: streak unchanged
- Missed day: streak = 1

### XP System
- Correct answer: +5 XP
- Lesson completion: +10 XP
- Perfect lesson bonus: +5 XP (when no hearts lost)

### API Design
- Resource-oriented endpoints
- Backend-authoritative answer validation
- Predictable response schemas
- SQLite-first with SQLAlchemy ORM

### Seed Data
- One language course (Spanish)
- 3 units, 5 skills, 9 lessons, ~60 exercises
- 1 default user with progress entries
- Achievements for milestones