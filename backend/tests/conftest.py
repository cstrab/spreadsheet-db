import pytest
from fastapi.testclient import TestClient
from datetime import date, datetime
from sqlalchemy import Column, create_engine, text, Integer, String, Boolean, Date, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List, Optional

from main import app, get_db
from models.models import DATABASE_URL, SCHEMA_NAME
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING 

UNIT_TEST_TABLE = "sample_table_unit_test"

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# SQLAlchemy model for SampleTableUnitTest
class SampleTableUnitTest(Base):
    __tablename__ = UNIT_TEST_TABLE
    __table_args__ = {'schema': SCHEMA_NAME}
    id = Column(Integer, primary_key=True, index=True)
    string_column = Column(String, index=True)
    int_column = Column(Integer, index=True)
    float_column = Column(Float, index=True)
    bool_column = Column(Boolean, index=True)
    date_column = Column(Date, index=True)
    datetime_column = Column(DateTime, index=True)

# Schemas for SampleTableUnitTest
class SampleTableUnitTestBase(BaseModel):
    string_column: Optional[str]
    int_column: Optional[int]
    float_column: Optional[float]
    bool_column: Optional[bool]
    date_column: Optional[date]
    datetime_column: Optional[datetime]

class SampleTableUnitTestUpdate(SampleTableUnitTestBase):
    id: Optional[int]

class SampleTableUnitTestRead(SampleTableUnitTestBase):
    id: int

class SampleTableUnitTestListUpdate(BaseModel):
    data: List[SampleTableUnitTestUpdate]

class BulkUpdate(BaseModel):
    table_name: str
    updates: SampleTableUnitTestListUpdate

class Update(BulkUpdate):
    removed_row_ids: List[int]

# Initial setup for database table creation and population
@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    session.execute(text(f"""
    CREATE TABLE IF NOT EXISTS {SCHEMA_NAME}.{UNIT_TEST_TABLE} (
        id SERIAL PRIMARY KEY,
        string_column VARCHAR(255),
        int_column INTEGER,
        float_column DOUBLE PRECISION,
        bool_column BOOLEAN,
        date_column DATE,
        datetime_column TIMESTAMP
    );
    """))
    session.execute(text(f"""
    INSERT INTO {SCHEMA_NAME}.{UNIT_TEST_TABLE} (string_column, int_column, float_column, bool_column, date_column, datetime_column)
    VALUES ('Test1', 1, 1.0, true, '2023-01-01', '2023-01-01T00:00:00'),
           ('Test2', 2, 2.0, false, '2023-02-02', '2023-02-02T00:00:00')
    ON CONFLICT DO NOTHING;  -- Prevent duplicate entries
    """))
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

# Fixture for overriding model and schema mappings
@pytest.fixture(scope="module")
def client(db_session):
    original_table_model_mapping = TABLE_MODEL_MAPPING.copy()
    original_table_schema_mapping = TABLE_SCHEMA_MAPPING.copy()

    TABLE_MODEL_MAPPING[UNIT_TEST_TABLE] = SampleTableUnitTest
    TABLE_SCHEMA_MAPPING[UNIT_TEST_TABLE] = {
        "read": SampleTableUnitTestRead,
        "update": SampleTableUnitTestUpdate,
        "list_update": SampleTableUnitTestListUpdate,
    }

    with TestClient(app) as client:
        yield client

    TABLE_MODEL_MAPPING.clear()
    TABLE_MODEL_MAPPING.update(original_table_model_mapping)
    TABLE_SCHEMA_MAPPING.clear()
    TABLE_SCHEMA_MAPPING.update(original_table_schema_mapping)
