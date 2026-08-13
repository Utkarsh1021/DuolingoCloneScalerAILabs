from app.db import engine, SessionLocal
from sqlalchemy import inspect, text

inspector = inspect(engine)
tables = inspector.get_table_names()
print('11 Tables:', sorted(tables))
print()

# Check achievements table structure
print('achievements table:')
cols = inspector.get_columns('achievements')
for c in cols:
    name = c['name']
    ctype = str(c['type'])
    print(f'  {name}: {ctype}')

print()
print('user_achievements table:')
cols = inspector.get_columns('user_achievements')
for c in cols:
    name = c['name']
    ctype = str(c['type'])
    print(f'  {name}: {ctype}')

# Check row counts
print()
print('Row counts:')
db = SessionLocal()
for t in tables:
    result = db.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar()
    print(f'  {t}: {result}')
db.close()