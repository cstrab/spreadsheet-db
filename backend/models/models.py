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

class TableOne(Base):
    __tablename__ = 'table_one'
    __table_args__ = {'schema': 'test_schema'}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)

class TableTwo(Base):
    __tablename__ = 'table_two'
    __table_args__ = {'schema': 'test_schema'}
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    details = Column(String, index=True)
    category = Column(String, index=True)

class TableThree(Base):
    __tablename__ = 'table_three'
    __table_args__ = {'schema': 'test_schema'}
    id = Column(Integer, primary_key=True, index=True)
    string_column = Column(String, index=True)
    int_column = Column(Integer, index=True)
    float_column = Column(Float, index=True)
    bool_column = Column(Boolean, index=True)
    date_column = Column(Date, index=True)
    datetime_column = Column(DateTime, index=True)

class BinMaster(Base):
    __tablename__ = 'bin_master'
    __table_args__ = {'schema': 'test_schema'}
    id = Column(Integer, primary_key=True, index=True)
    storage_type = Column(String, index=True)
    storage_bin = Column(String, index=True)
    phase_number = Column(String, index=True)
    phase_name = Column(String, index=True)
    bin_class = Column(String, index=True)
    bin_feature = Column(String, index=True)
    reservoir_qty_kg = Column(Float, index=True)
    primary_pouring_point = Column(String, index=True)
    secondary_pouring_point = Column(String, index=True)
    filling_point = Column(String, index=True)
    if_in_manual = Column(String, index=True)
    if_in_cdl = Column(String, index=True)
    cdl_drop_number = Column(String, index=True)
    if_in_cluster = Column(String, index=True)
    cluster_drop_number = Column(String, index=True)
    if_in_bulk = Column(String, index=True)
    bulk_drop_number = Column(String, index=True)
    if_in_kardex = Column(String, index=True)
    if_in_hcsd = Column(String, index=True)
    hcsd_drop_number = Column(String, index=True)
    if_in_sds = Column(String, index=True)
    sds_drop_number = Column(String, index=True)
    comment = Column(String, index=True)

DATABASE_URL = f"{DATABASE_TYPE}://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
