import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from sqlalchemy.orm import sessionmaker

from main import app
from models.models import DATABASE_URL
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING 
from tests.models import SCHEMA_NAME, UNIT_TEST_TABLE, Base, SampleTableUnitTest
from tests.schemas import SampleTableUnitTestRead, SampleTableUnitTestUpdate, SampleTableUnitTestListUpdate

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initial setup for database table creation and population
@pytest.fixture
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

# Override the table mappings for the test client
@pytest.fixture
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
