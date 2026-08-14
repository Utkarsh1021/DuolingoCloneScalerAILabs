"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import path, users, lessons, leaderboard
from app.config import settings
from app.db import SessionLocal, create_tables

app = FastAPI(
    title="Duolingo Clone API",
    version="1.0.0",
    description="Backend API for Duolingo clone application",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(path.router)
app.include_router(users.router)
app.include_router(lessons.router)
app.include_router(leaderboard.router)


@app.on_event("startup")
def on_startup():
    from app.db.seed import seed_database

    create_tables()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()