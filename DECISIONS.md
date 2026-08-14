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
- Simplified authentication: the backend uses the first user in the database (seeded "Utkarsh", id 1) as the current learner
- Heart regeneration calculated lazily on state request, not background job
- Streak logic deterministic based on last_active_date

### Exercise System
- Generic exercise model with type discriminator
- Frontend `ExerciseRenderer` switches on exercise.type
- Backend validates answers against correct_answer stored in database
- 5 types: multiple_choice, word_bank, match_pairs, fill_blank, type_answer (the latter also offers a text-to-speech button via the Web Speech API)

### Lesson State Machine
- States: `idle` → `active` → `completed` | `out_of_hearts` (tracked on the lesson `runtime` object in `useLesson.ts`)
- Prevents boolean variable mess and ensures proper state transitions

### Hearts System
- Max hearts: 5
- Wrong answer: -1 heart
- Lazy regeneration: 1 heart every 30 minutes, calculated on state request
- Update both UI and database consistently
- Refill: `POST /api/me/refill-hearts` restores 5 hearts for `REFILL_GEM_COST` (350) gems

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
- `GET /api/user` exposes `earned_achievement_ids` so the profile page highlights only genuinely earned achievement badges (fixed a bug where the profile unlocked cards by position instead of by earned id)

### Daily Activity Tracking
- A `UserDailyActivity` row is created/updated on lesson completion, keyed by the calendar date (a `Date()` column)
- Accumulates `xp_earned` which feeds the `xp_today` figure shown in the topbar/profile

### Sound Effects
- Procedural Web Audio API tones (no audio assets): ascending ding on correct, descending "wah" on wrong
- AudioContext is created/resumed on the first user gesture to satisfy the browser autoplay policy

### Learning Path UI
- The skill tree is rendered as a winding SVG road: completed/current nodes green (`#58cc02`), locked ones grey
- Current skill floats above the road with a START/CONTINUE bubble; completed skills show a crown + check

### Seed Data
- One language course (Spanish)
- 3 units, 5 skills, 6 lessons, 16 exercises covering all 5 types
- 1 default user (0 XP, 0 streak, 5 hearts, 1000 gems)
- 4 achievements for milestones + 7 leaderboard rivals