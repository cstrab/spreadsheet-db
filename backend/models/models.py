import os

from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


POSTGRES_USER = os.getenv('POSTGRES_USER')  
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD') 
POSTGRES_DB = os.getenv('POSTGRES_DB')  
POSTGRES_HOST = os.getenv('POSTGRES_HOST')  
POSTGRES_PORT = os.getenv('POSTGRES_PORT')  

Base = declarative_base()

class Item(Base):
    __tablename__ = 'items'
    __table_args__ = {'schema': 'test_schema'}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
