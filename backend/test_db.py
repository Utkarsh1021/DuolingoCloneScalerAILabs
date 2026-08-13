"""Test database setup and seeding."""
import sys
sys.path.insert(0, r'C:\Users\Utkarsh\Desktop\ScalerAssingment\backend')

from db import get_db, create_tables, seed_database
from sqlalchemy import select
from models.user import User
from models.course import Course

create_tables()

db_gen = get_db()
seed_database(db_gen)

# Verify
db = next(get_db())
user = db.query(User).first()
print(f"User: {user.name}, XP: {user.xp}, Streak: {user.streak}, Hearts: {user.hearts}")

skills = db.query(UserSkillProgress).all()
print(f"User skills: {[(s.skill_id, s.completed, s.progress) for s in skills]}")

course = db.scalar(select(Course))
print(f"Course: {course.name}, Units: {len(course.units)}")

print("Database test passed!")