import sys
import os
sys.path.insert(0, os.getcwd())

from app.db import get_db, create_tables, seed_database
from sqlalchemy import select
from models.user import User
from models.course import Course

create_tables()
db_gen = get_db()
seed_database(db_gen)
db = next(get_db())
user = db.query(User).first()
print(f"User: {user.name}, XP: {user.xp}, Streak: {user.streak}, Hearts: {user.hearts}")

skills = db.query(UserSkillProgress).all()
for s in skills:
    print(f"Skill {s.skill_id}: progress={s.progress}, completed={s.completed}")

course = db.scalar(select(Course))
print(f"Course: {course.name}, Units: {len(course.units)}")

print("OK - Database seeded successfully!")