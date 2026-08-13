import sys
sys.path.insert(0, r'C:\Users\Utkarsh\Desktop\ScalerAssingment\backend')

from app.db import engine, SessionLocal
from sqlalchemy import inspect, text

inspector = inspect(engine)

# 1. Check user_skill_progress
print('=== user_skill_progress ===')
cols = inspector.get_columns('user_skill_progress')
for c in cols:
    print(f'  {c["name"]}: {c["type"]}')

fks = inspector.get_foreign_keys('user_skill_progress')
for fk in fks:
    print(f'  FK: {fk["constrained_columns"]} -> {fk["referred_table"]}.{fk["referred_columns"]}')

# Check indexes for this table
idxs = inspector.get_indexes('user_skill_progress')
print(f'  Indexes: {idxs}')

# 2. Check units.course_id
print()
print('=== units ===')
cols = inspector.get_columns('units')
for c in cols:
    print(f'  {c["name"]}: {c["type"]}')

fks = inspector.get_foreign_keys('units')
for fk in fks:
    print(f'  FK: {fk["constrained_columns"]} -> {fk["referred_table"]}.{fk["referred_columns"]}')

# Check indexes for units
idxs = inspector.get_indexes('units')
print(f'  Indexes on units: {idxs}')

# 3. Check all indexes
print()
print('=== All indexes ===')
all_tables = inspector.get_table_names()
for table in all_tables:
    idxs = inspector.get_indexes(table)
    if idxs:
        print(f'  {table}:')
        for idx in idxs:
            print(f'    {idx["name"]}: {idx["column_names"]} (unique: {idx["unique"]})')

# 4. List all tables
print()
print('=== All tables ===')
print(all_tables)