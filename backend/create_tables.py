from app.models.base import Base
from app.db import engine

Base.metadata.create_all(bind=engine)
print('Tables created successfully')