import os

from sqlalchemy import Column, create_engine, Integer, String, Float, Boolean, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_TYPE = 'postgresql'
DATABASE_USER = os.getenv('POSTGRES_USER')
DATABASE_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DATABASE_NAME = os.getenv('POSTGRES_DB')
DATABASE_HOST = os.getenv('POSTGRES_HOST')
DATABASE_PORT = os.getenv('POSTGRES_PORT')

SCHEMA_NAME = 'sample_schema'

Base = declarative_base()

class SampleTableTypes(Base):
    __tablename__ = 'sample_table_types'
    __table_args__ = {'schema': SCHEMA_NAME}
    id = Column(Integer, primary_key=True, index=True)
    string_column = Column(String, index=True)
    int_column = Column(Integer, index=True)
    float_column = Column(Float, index=True)
    bool_column = Column(Boolean, index=True)
    date_column = Column(Date, index=True)
    datetime_column = Column(DateTime, index=True)

class SampleTableUsers(Base):
    __tablename__ = 'sample_table_users'
    __table_args__ = {'schema': SCHEMA_NAME}
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, index=True)
    city = Column(String, index=True)
    state = Column(String, index=True)
    zip = Column(Integer, index=True)
    age = Column(Integer, index=True)
    date_created = Column(Date, index=True)
    is_active = Column(Boolean, index=True)

DATABASE_URL = f"{DATABASE_TYPE}://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
