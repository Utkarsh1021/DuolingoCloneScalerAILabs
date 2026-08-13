"""Main FastAPI application."""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.db import SessionLocal, seed_database
from app.config import settings

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


@app.on_event("startup")
def on_startup():
    # Create database session and seed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()