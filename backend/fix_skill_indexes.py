import sys
sys.path.insert(0, r'.')

from app.db import engine, SessionLocal
from sqlalchemy import inspect, text

conn = engine.connect()
inspector = inspect(engine)

# Check skill table indexes
idxs = inspector.get_indexes('skill')
print('skill table indexes:', idxs)

# Try creating indexes on skill table
try:
    conn.execute(text('CREATE INDEX ix_skill_unit_id ON skill(unit_id)'))
    conn.commit()
    print('Added ix_skill_unit_id')
except Exception as e:
    print(f'Failed ix_skill_unit_id: {e}')

try:
    conn.execute(text('CREATE INDEX ix_skill_required_skill_id ON skill(required_skill_id)'))
    conn.commit()
    print('Added ix_skill_required_skill_id')
except Exception as e:
    print(f'Failed ix_skill_required_skill_id: {e}')

# Verify
idxs = inspector.get_indexes('skill')
print('skill table indexes after:', idxs)

conn.close()