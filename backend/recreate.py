import sys
sys.path.insert(0, r'.')

from app.db import engine, SessionLocal
from sqlalchemy import inspect, text, UniqueConstraint

# Step 1: Create all tables with updated models
print('Creating tables...')
Base = __import__('app.models.base', fromlist=['Base']).Base
Base.metadata.create_all(bind=engine)
print('Tables created!')

conn = engine.connect()
inspector = inspect(engine)
tables = inspector.get_table_names()
db = SessionLocal()

print()
print('=== NEW 11-TABLE SCHEMA ===')
for t in sorted(tables):
    result = db.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar()
    print(f'  {t}: {result} rows')

# Check user_skill_progress has UniqueConstraint
print()
print('--- user_skill_progress CREATE SQL ---')
cur = conn.execute(text(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='user_skill_progress'"))
rows = cur.fetchall()
if rows:
    sql = rows[0]
    print(sql)
else:
    print('Table not found or error')

# Check all indexes
print()
print('--- All indexes ---')
for table in sorted(tables):
    idxs = inspector.get_indexes(table)
    if idxs:
        for idx in idxs:
            print(f'  {table}.{idx["name"]}: {idx["column_names"]} (unique: {idx["unique"]})')

# Add composite index on user_daily_activity(user_id, activity_date) via raw SQL
print()
print('--- Adding composite index on user_daily_activity ---')
conn.execute(text('CREATE INDEX ix_user_daily_activity_user_date ON user_daily_activity(user_id, activity_date)'))
conn.commit()
print('Index created!')

# Verify the new index
idxs = inspector.get_indexes('user_daily_activity')
print(f'  user_daily_activity indexes: {idxs}')

# Add index on lesson_attempts.user_id
print()
print('--- Adding index on lesson_attempts.user_id ---')
conn.execute(text('CREATE INDEX ix_lesson_attempts_user_id ON lesson_attempts(user_id)'))
conn.commit()
print('Index created!')

idxs = inspector.get_indexes('lesson_attempts')
print(f'  lesson_attempts indexes: {idxs}')

# Add index on lesson_attempts.lesson_id
print()
print('--- Adding index on lesson_attempts.lesson_id ---')
conn.execute(text('CREATE INDEX ix_lesson_attempts_lesson_id ON lesson_attempts(lesson_id)'))
conn.commit()
print('Index created!')

idxs = inspector.get_indexes('lesson_attempts')
print(f'  lesson_attempts indexes: {idxs}')

# Add index on skills.unit_id
print()
print('--- Adding index on skills.unit_id ---')
conn.execute(text('CREATE INDEX ix_skills_unit_id ON skills(unit_id)'))
conn.commit()
print('Index created!')

# Check skill indexes
idxs = inspector.get_indexes('skill')
print(f'  skill indexes after: {idxs}')

# Add index on skills.required_skill_id
print()
print('--- Adding index on skills.required_skill_id ---')
conn.execute(text('CREATE INDEX ix_skills_required_skill_id ON skills(required_skill_id)'))
conn.commit()
print('Index created!')

idxs = inspector.get_indexes('skill')
print(f'  skill indexes after: {idxs}')

# Check that user_achievements UniqueConstraint exists
print()
print('--- user_achievements UniqueConstraint check ---')
cur = conn.execute(text(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='user_achievements'"))
tbl_sql = cur.fetchone()[0]
print(f'  Table SQL: {tbl_sql}')

db.close()
conn.close()

print()
print('=== RECREATION COMPLETE ===')
PYEOF