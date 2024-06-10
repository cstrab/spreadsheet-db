from pydantic import BaseModel, validator, ValidationError
from typing import List, Optional, Union, Any, Dict, Type
from datetime import date, datetime

# Schemas for SampleTableUnitTest
class SampleTableUnitTestBase(BaseModel):
    string_column: Optional[str]
    int_column: Optional[int]
    float_column: Optional[float]
    bool_column: Optional[bool]
    date_column: Optional[date]
    datetime_column: Optional[datetime]

class SampleTableUnitTestUpdate(BaseModel):
    id: Optional[int] = None
    string_column: Optional[str] = None
    int_column: Optional[int] = None
    float_column: Optional[float] = None
    bool_column: Optional[bool] = None
    date_column: Optional[date] = None
    datetime_column: Optional[datetime] = None

class SampleTableUnitTestRead(SampleTableUnitTestBase):
    id: int

class SampleTableUnitTestListUpdate(BaseModel):
    data: List[SampleTableUnitTestUpdate]

# Function to validate update data based on table_name
def validate_update_data(v: Any, table_name: str, model_mapping: Dict[str, Type[BaseModel]]) -> Any:
    if table_name in model_mapping:
        schema = model_mapping[table_name]
        try:
            return schema(**v)
        except ValidationError as e:
            raise ValueError(f"Invalid update data for table {table_name}: {e}")
    else:
        raise ValueError(f"Table not found in mappings: {table_name}")

# Schema for bulk update operations
class BulkUpdateUnitTest(BaseModel):
    table_name: str
    updates: Union[
        SampleTableUnitTestListUpdate,
    ]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        return validate_update_data(v, table_name, {
            'sample_table_unit_test': SampleTableUnitTestListUpdate,
        })

# Schema for update operations
class UpdateUnitTest(BulkUpdateUnitTest):
    removed_row_ids: List[int]