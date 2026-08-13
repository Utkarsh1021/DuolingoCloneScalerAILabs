"""Database session and initialization."""

import os
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(
    "sqlite:///duolingo.db",
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables if they don't exist."""
    # Use a raw connection to create tables if they don't exist
    # This avoids the need to import models
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Create tables for the models we know about
    # User table
    if "user" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    avatar TEXT,
                    xp INTEGER DEFAULT 0,
                    streak INTEGER DEFAULT 0,
                    hearts INTEGER DEFAULT 5,
                    gems INTEGER DEFAULT 120,
                    daily_goal INTEGER DEFAULT 20,
                    last_active_date DATETIME,
                    created_at DATETIME
                )
            """)
            conn.commit()
    
    # UserSkillProgress table
    if "user_skill_progress" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_skill_progress (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    skill_id INTEGER,
                    progress INTEGER DEFAULT 0,
                    crowns INTEGER DEFAULT 0,
                    completed BOOLEAN DEFAULT FALSE,
                    updated_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
                    FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE
                )
            """)
            conn.commit()
    
    # UserAchievement table
    if "user_achievement" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_achievement (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    title TEXT NOT NULL,
                    description TEXT,
                    earned_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
                )
            """)
            conn.commit()
    
    # Course table
    if "course" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS course (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    language TEXT DEFAULT 'Spanish',
                    description TEXT,
                    order_index INTEGER DEFAULT 0
                )
            """)
            conn.commit()
    
    # ... add more tables as needed
    
    # Skill table
    if "skill" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS skill (
                    id INTEGER PRIMARY KEY,
                    unit_id INTEGER,
                    title TEXT,
                    description TEXT,
                    order_index INTEGER DEFAULT 0,
                    required_skill_id INTEGER,
                    FOREIGN KEY (unit_id) REFERENCES unit(id) ON DELETE CASCADE,
                    FOREIGN KEY (required_skill_id) REFERENCES skill(id) ON DELETE CASCADE
                )
            """)
            conn.commit()
    
    # Unit table
    if "unit" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS unit (
                    id INTEGER PRIMARY KEY,
                    course_id INTEGER,
                    title TEXT,
                    description TEXT,
                    order_index INTEGER DEFAULT 0,
                    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
                )
            """)
            conn.commit()
    
    # Lesson table
    if "lesson" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS lesson (
                    id INTEGER PRIMARY KEY,
                    skill_id INTEGER,
                    title TEXT,
                    description TEXT,
                    order_index INTEGER DEFAULT 0,
                    xp_reward INTEGER DEFAULT 10,
                    FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE
                )
            """)
            conn.commit()
    
    # Exercise table
    if "exercise" not in existing_tables:
        with engine.connect() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS exercise (
                    id INTEGER PRIMARY KEY,
                    lesson_id INTEGER,
                    type TEXT NOT NULL,
                    question TEXT NOT NULL,
                    correct_answer TEXT NOT NULL,
                    data TEXT,
                    order_index INTEGER DEFAULT 0,
                    FOREIGN KEY (lesson_id) REFERENCES lesson(id) ON DELETE CASCADE
                )
            """)
            conn.commit()