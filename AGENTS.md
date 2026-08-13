# AGENTS.md

This file provides guidance for AI agents working on this project.

## Project Structure

- `backend/` - FastAPI Python backend
- `frontend/` - Next.js TypeScript frontend

## Development Commands

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend
python -m pytest

# Frontend lint
cd frontend
npm run lint
```

## Code Conventions

- Frontend: TypeScript, Tailwind CSS, Next.js 16
- Backend: Python 3.10, FastAPI, SQLAlchemy 2.x
- Database: SQLite with SQLAlchemy ORM
- Follow the existing code patterns in each directory
- Keep components modular and reusable
- API responses should match the types defined in lib/types.ts

## Adding New Features

1. **New Exercise Type**: Add the type to the `Exercise` model, create a new component in `frontend/components/lesson/`, and update the `ExerciseRenderer` switch in `LessonPlayer.tsx`

2. **New API Endpoint**: Add the route in `backend/app/api/`, create the service logic in `backend/app/services/`, and update the frontend hook in `frontend/hooks/`

3. **New Page**: Create the page in `frontend/app/`, add navigation in the sidebar, and connect to the API

## Common Issues

- Database tables not created: Ensure `create_tables()` runs on startup
- CORS errors: Check `config.py` CORS_ORIGINS setting
- Import errors: Ensure all models are imported before `Base.metadata.create_all()`