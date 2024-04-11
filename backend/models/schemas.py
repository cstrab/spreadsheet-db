from typing import List, Optional, Union, Any, Dict, Type

from pydantic import BaseModel, validator, ValidationError

from utils.logger import setup_logger


logger = setup_logger('backend')

# Schemas for TableOne
class TableOneBase(BaseModel):
    name: Optional[str]
    description: Optional[str]

class TableOneUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class TableOneRead(TableOneBase):
    id: int

class TableOneListUpdate(BaseModel):
    data: List[TableOneUpdate]

# Schemas for TableTwo
class TableTwoBase(BaseModel):
    title: Optional[str]
    details: Optional[str]
    category: Optional[str]

class TableTwoUpdate(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    details: Optional[str] = None
    category: Optional[str] = None

class TableTwoRead(TableTwoBase):
    id: int

class TableTwoListUpdate(BaseModel):
    data: List[TableTwoUpdate]

# Schemas for TableThree
class TableThreeBase(BaseModel):
    string_column: Optional[str]
    int_column: Optional[int]
    float_column: Optional[float]

class TableThreeUpdate(BaseModel):
    id: Optional[int] = None
    string_column: Optional[str] = None
    int_column: Optional[int] = None
    float_column: Optional[float] = None

class TableThreeRead(TableThreeBase):
    id: int

class TableThreeListUpdate(BaseModel):
    data: List[TableThreeUpdate]

# Schema for read operations
class Read(BaseModel):
    table_name: str
    skip: int = 0
    limit: int = 100

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
        TableOneListUpdate,
        TableTwoListUpdate,
        TableThreeListUpdate,
    ]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        logger.info(f"Validating bulk updates for table: {table_name}")
        return validate_update_data(v, table_name, {
            'table_one': TableOneListUpdate,
            'table_two': TableTwoListUpdate,
            'table_three': TableThreeListUpdate,
        })

# Schema for update operations
class Update(BulkUpdate):
    removed_row_ids: List[int]
