import pytest
from fastapi.testclient import TestClient
from datetime import date
from sqlalchemy import Column, create_engine, text, Integer, String, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List, Optional

from main import app, get_db
from models.models import DATABASE_URL, SCHEMA_NAME
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING  # Import your mappings

# Constants
UNIT_TEST_TABLE = "sample_table_unit_test"

# Create a new engine and session for testing
engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define test-specific models
Base = declarative_base()

class SampleTableUnitTest(Base):
    __tablename__ = UNIT_TEST_TABLE
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

# Define test-specific schemas
class SampleTableUnitTestBase(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip: Optional[int]
    age: Optional[int]
    date_created: Optional[date]
    is_active: Optional[bool]

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

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Use constants for table and schema names
    session.execute(text(f"""
    CREATE TABLE IF NOT EXISTS {SCHEMA_NAME}.{UNIT_TEST_TABLE} (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100),
        city VARCHAR(50),
        state VARCHAR(50),
        zip INTEGER,
        age INTEGER,
        date_created DATE,
        is_active BOOLEAN
    );
    """))
    session.execute(text(f"""
    INSERT INTO {SCHEMA_NAME}.{UNIT_TEST_TABLE} (first_name, last_name, email, city, state, zip, age, date_created, is_active)
    VALUES ('John', 'Doe', 'john.doe@example.com', 'City', 'State', 12345, 30, '2023-01-01', true),
           ('Jane', 'Doe', 'jane.doe@example.com', 'City', 'State', 12345, 25, '2023-01-01', true)
    ON CONFLICT DO NOTHING;  -- Prevent duplicate entries
    """))
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db_session):
    # Override the mappings with the test-specific ones
    original_table_model_mapping = TABLE_MODEL_MAPPING.copy()
    original_table_schema_mapping = TABLE_SCHEMA_MAPPING.copy()

    TABLE_MODEL_MAPPING[UNIT_TEST_TABLE] = SampleTableUnitTest
    TABLE_SCHEMA_MAPPING[UNIT_TEST_TABLE] = {
        "read": SampleTableUnitTestRead,
        "update": SampleTableUnitTestUpdate,
        "list_update": SampleTableUnitTestListUpdate,
    }

    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client

    # Restore the original mappings
    TABLE_MODEL_MAPPING.clear()
    TABLE_MODEL_MAPPING.update(original_table_model_mapping)
    TABLE_SCHEMA_MAPPING.clear()
    TABLE_SCHEMA_MAPPING.update(original_table_schema_mapping)
