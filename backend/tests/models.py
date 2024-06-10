from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base

SCHEMA_NAME = "sample_schema"
UNIT_TEST_TABLE = "sample_table_unit_test"

Base = declarative_base()

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