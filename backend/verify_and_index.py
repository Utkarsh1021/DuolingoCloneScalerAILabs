import sys
sys.path.insert(0, r'.')

from app.db import engine, SessionLocal
from sqlalchemy import inspect, text

conn = engine.connect()
inspector = inspect(engine)
db = SessionLocal()
tables = inspector.get_table_names()

print('=== VERIFIED 11-TABLE SCHEMA ===')
for t in sorted(tables):
    result = db.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar()
    print(f'  {t}: {result} rows')

print()
print('--- user_skill_progress CREATE SQL ---')
cur = conn.execute(text(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='user_skill_progress'"))
rows = cur.fetchall()
if rows:
    print(rows[0])

print()
print('--- user_achievements UniqueConstraint ---')
cur = conn.execute(text(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='user_achievements'"))
rows = cur.fetchall()
if rows:
    print(rows[0])

print()
print('--- Adding prioritized indexes ---')

# Index on user_daily_activity(user_id, activity_date)
try:
    conn.execute(text('CREATE INDEX ix_user_daily_activity_user_date ON user_daily_activity(user_id, activity_date)'))
    conn.commit()
    print('  Added ix_user_daily_activity_user_date')
except Exception as e:
    print(f'  Failed ix_user_daily_activity_user_date: {e}')

# Index on lesson_attempts.user_id
try:
    conn.execute(text('CREATE INDEX ix_lesson_attempts_user_id ON lesson_attempts(user_id)'))
    conn.commit()
    print('  Added ix_lesson_attempts_user_id')
except Exception as e:
    print(f'  Failed ix_lesson_attempts_user_id: {e}')

# Index on lesson_attempts.lesson_id
try:
    conn.execute(text('CREATE INDEX ix_lesson_attempts_lesson_id ON lesson_attempts(lesson_id)'))
    conn.commit()
    print('  Added ix_lesson_attempts_lesson_id')
except Exception as e:
    print(f'  Failed ix_lesson_attempts_lesson_id: {e}')

# Index on skills.unit_id
try:
    conn.execute(text('CREATE INDEX ix_skills_unit_id ON skills(unit_id)'))
    conn.commit()
    print('  Added ix_skills_unit_id')
except Exception as e:
    print(f'  Failed ix_skills_unit_id: {e}')

# Index on skills.required_skill_id
try:
    conn.execute(text('CREATE INDEX ix_skills_required_skill_id ON skills(required_skill_id)'))
    conn.commit()
    print('  Added ix_skills_required_skill_id')
except Exception as e:
    print(f'  Failed ix_skills_required_skill_id: {e}')

# Verify the new indexes
print()
print('--- Verified indexes ---')
for table in sorted(tables):
    idxs = inspector.get_indexes(table)
    if idxs:
        for idx in idxs:
            print(f'  {table}.{idx["name"]}: {idx["column_names"]} (unique: {idx["unique"]})')

db.close()
conn.close()
print()
print('=== DONE ===')