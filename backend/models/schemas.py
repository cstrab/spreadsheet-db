from typing import List, Optional, Union, Any, Dict, Type
from datetime import date, datetime

from pydantic import BaseModel, validator, ValidationError

from utils.logger import setup_logger


logger = setup_logger('backend')

# Schemas for SampleTableTypes
class SampleTableTypesBase(BaseModel):
    string_column: Optional[str]
    int_column: Optional[int]
    float_column: Optional[float]
    bool_column: Optional[bool]
    date_column: Optional[date]
    datetime_column: Optional[datetime]

class SampleTableTypesUpdate(BaseModel):
    id: Optional[int] = None
    string_column: Optional[str] = None
    int_column: Optional[int] = None
    float_column: Optional[float] = None
    bool_column: Optional[bool] = None
    date_column: Optional[date] = None
    datetime_column: Optional[datetime] = None

class SampleTableTypesRead(SampleTableTypesBase):
    id: int

class SampleTableTypesListUpdate(BaseModel):
    data: List[SampleTableTypesUpdate]

# Schemas for SampleTableUsers
class SampleTableUsersBase(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip: Optional[int]
    age: Optional[int]
    date_created: Optional[date]
    is_active: Optional[bool]

class SampleTableUsersUpdate(BaseModel):
    id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[int] = None
    age: Optional[int] = None
    date_created: Optional[date] = None
    is_active: Optional[bool] = None

class SampleTableUsersRead(SampleTableUsersBase):
    id: int

class SampleTableUsersListUpdate(BaseModel):
    data: List[SampleTableUsersUpdate]

# Function to validate update data based on table_name
def validate_update_data(v: Any, table_name: str, model_mapping: Dict[str, Type[BaseModel]]) -> Any:
    if table_name in model_mapping:
        schema = model_mapping[table_name]
        try:
            return schema(**v)
        except ValidationError as e:
            logger.error(f"Invalid update data for table {table_name}: {e}")
            raise ValueError(f"Invalid update data for table {table_name}: {e}")
    else:
        logger.error(f"Table not found in mappings: {table_name}")
        raise ValueError(f"Table not found in mappings: {table_name}")

# Schema for bulk update operations
class BulkUpdate(BaseModel):
    table_name: str
    updates: Union[
        SampleTableTypesListUpdate,
        SampleTableUsersListUpdate,
    ]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        logger.info(f"Validating bulk updates for table: {table_name}")
        return validate_update_data(v, table_name, {
            'sample_table_types': SampleTableTypesListUpdate,
            'sample_table_users': SampleTableUsersListUpdate,
        })

# Schema for update operations
class Update(BulkUpdate):
    removed_row_ids: List[int]
