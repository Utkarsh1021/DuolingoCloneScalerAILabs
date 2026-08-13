import sys
sys.path.insert(0, r'C:\Users\Utkarsh\Desktop\ScalerAssingment\backend\app')

from app.models.base import Base
from app.models import user, course  # Import all models
from app.db.seed import seed_database
from app.db import SessionLocal, engine

# Create tables first
Base.metadata.create_all(bind=engine)

# Seed the database
db = SessionLocal()
seed_database(db)
db.close()
print("Database seeded successfully!")