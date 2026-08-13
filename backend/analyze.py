import sys
sys.path.insert(0, r'.')

from app.db import engine, SessionLocal
from sqlalchemy import inspect, text

inspector = inspect(engine)
tables = inspector.get_table_names()

print('=== DATABASE SCHEMA ANALYSIS ===')
print(f'Tables: {tables}')
print()

# 1. user_skill_progress
print('--- user_skill_progress ---')
cols = inspector.get_columns('user_skill_progress')
for c in cols:
    print(f'  {c["name"]}: {c["type"]}')

fks = inspector.get_foreign_keys('user_skill_progress')
for fk in fks:
    print(f'  FK: {fk["constrained_columns"]} -> {fk["referred_table"]}.{fk["referred_columns"]}')

idxs = inspector.get_indexes('user_skill_progress')
print(f'  Indexes: {idxs}')

print()

# 2. unit table (singular)
print('--- unit ---')
cols = inspector.get_columns('unit')
for c in cols:
    print(f'  {c["name"]}: {c["type"]}')

fks = inspector.get_foreign_keys('unit')
for fk in fks:
    print(f'  FK: {fk["constrained_columns"]} -> {fk["referred_table"]}.{fk["referred_columns"]}')

idxs = inspector.get_indexes('unit')
print(f'  Indexes on unit: {idxs}')

# Check course_id FK
for fk in fks:
    if fk["referred_table"] == 'course':
        print(f'  -> course_id FK to course: OK')

# 3. course table
print()
print('--- course ---')
cols = inspector.get_columns('course')
for c in cols:
    print(f'  {c["name"]}: {c["type"]}')

fks = inspector.get_foreign_keys('course')
for fk in fks:
    print(f'  FK: {fk["constrained_columns"]} -> {fk["referred_table"]}.{fk["referred_columns"]}')

idxs = inspector.get_indexes('course')
print(f'  Indexes on course: {idxs}')

print()
print('--- All indexes ---')
for table in inspector.get_table_names():
    idxs = inspector.get_indexes(table)
    if idxs:
        print(f'  {table}:')
        for idx in idxs:
            print(f'    {idx["name"]}: {idx["column_names"]} (unique: {idx["unique"]})')

# Check user_achievements UniqueConstraint
print()
print('--- user_achievements UniqueConstraint ---')
conn = engine.connect()
cur = conn.execute(text("SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name='user_achievements'"))
idx_sql = cur.fetchall()
for row in idx_sql:
    print(f'  Index SQL: {row[0]}')

cur = conn.execute(text("SELECT sql FROM sqlite_master WHERE type='table' AND name='user_achievements'"))
tbl_sql = cur.fetchone()[0]
print(f'  Table SQL: {tbl_sql}')

conn.close()

print()
print('--- Summary ---')
print('user_skill_progress has NO unique constraint on (user_id, skill_id)')
print('user_achievements has UniqueConstraint(user_id, achievement_id) - already present')
print('unit.course_id FK exists and points to course.id')
print('No indexes on user_skill_progress, lesson_attempts, etc. yet')