"""Shared pytest fixtures.

Uses an isolated in-memory SQLite DB so tests never touch the dev database.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.db as db_module
import app.main as main_module
from app.main import app


@pytest.fixture
def client():
    # Isolated in-memory DB with a shared static connection so all sessions
    # (including app startup) see the same tables.
    engine_test = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    session_test = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine_test,
    )

    original_db_engine = db_module.engine
    original_db_session = db_module.SessionLocal
    original_main_session = main_module.SessionLocal

    db_module.engine = engine_test
    db_module.SessionLocal = session_test
    main_module.SessionLocal = session_test

    from app.models.base import Base
    from app.models import course, user  # noqa: F401  (register models)

    Base.metadata.create_all(bind=engine_test)

    with TestClient(app) as c:
        yield c

    db_module.engine = original_db_engine
    db_module.SessionLocal = original_db_session
    main_module.SessionLocal = original_main_session
    engine_test.dispose()


@pytest.fixture
def seeded_client(client):
    """Client whose DB has been seeded via seed_database."""
    from app.db import get_db
    from app.db.seed import seed_database

    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    return client