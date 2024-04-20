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

Base = declarative_base()

class SampleTable(Base):
    __tablename__ = 'sample_table'
    __table_args__ = {'schema': 'sample_schema'}
    id = Column(Integer, primary_key=True, index=True)
    string_column = Column(String, index=True)
    int_column = Column(Integer, index=True)
    float_column = Column(Float, index=True)
    bool_column = Column(Boolean, index=True)
    date_column = Column(Date, index=True)
    datetime_column = Column(DateTime, index=True)

class MaterialMaster(Base):
    __tablename__ = 'material_master'
    __table_args__ = {'schema': 'sample_schema'}
    id = Column(Integer, primary_key=True, index=True)
    plant = Column(String, index=True)
    material = Column(String, index=True)
    description = Column(String, index=True)
    flashpoint = Column(Integer, index=True)
    is_automation_possible = Column(String, index=True)
    low_flashpoint = Column(String, index=True)
    crystal = Column(String, index=True)
    crystalizes = Column(String, index=True)
    citrus = Column(String, index=True)
    refrigerate = Column(String, index=True)
    nitrogen = Column(String, index=True)
    heated = Column(String, index=True)
    difficult_heat = Column(String, index=True)
    mix_well = Column(String, index=True)
    viscous = Column(String, index=True)
    slightly_viscous = Column(String, index=True)
    solid = Column(String, index=True)
    solidifies = Column(String, index=True)
    separates = Column(String, index=True)
    stench = Column(String, index=True)
    moss_oleo_resins = Column(String, index=True)
    wax = Column(String, index=True)
    special_handling = Column(String, index=True)
    plastic_storage = Column(String, index=True)
    supply_issue = Column(String, index=True)
    phantom = Column(String, index=True)
    additional_comments = Column(String, index=True)

DATABASE_URL = f"{DATABASE_TYPE}://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
