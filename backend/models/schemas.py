from typing import List, Optional, Union

from pydantic import BaseModel, validator

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

# Schema for read operations
class Read(BaseModel):
    table_name: str
    skip: int = 0
    limit: int = 100

# Schema for update operations
class Update(BaseModel):
    table_name: str
    updates: Union[
        TableOneListUpdate, 
        TableTwoListUpdate,
    ]
    removed_row_ids: List[int]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        if table_name == 'table_one':
            logger.info("Using TableOneListUpdate schema for updates")
            return TableOneListUpdate(**v)
        elif table_name == 'table_two':
            logger.info("Using TableTwoListUpdate schema for updates")
            return TableTwoListUpdate(**v)
        else:
            logger.error(f"Invalid table_name: {table_name}")
            raise ValueError('Invalid table_name')
        