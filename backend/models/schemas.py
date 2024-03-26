from typing import List, Optional, Union

from pydantic import BaseModel, validator


# Schemas for TableOne
class TableOneBase(BaseModel):
    name: str
    description: str

class TableOneCreate(TableOneBase):
    pass

class TableOneUpdate(BaseModel):
    id: int
    name: Optional[str] = None
    description: Optional[str] = None

class TableOneRead(TableOneBase):
    id: int

    # TODO: Investigate why this is not working as intended
    # class Config:
    #     orm_mode = True

class TableOneListUpdate(BaseModel):
    data: List[TableOneUpdate]

# Schemas for TableTwo
class TableTwoBase(BaseModel):
    title: str
    details: str
    category: str

class TableTwoCreate(TableTwoBase):
    pass

class TableTwoUpdate(BaseModel):
    id: int
    title: Optional[str] = None
    details: Optional[str] = None
    category: Optional[str] = None

class TableTwoRead(TableTwoBase):
    id: int

    # TODO: Investigate why this is not working as intended
    # class Config:
    #     orm_mode = True

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
    updates: Union[TableOneListUpdate, TableTwoListUpdate]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        if table_name == 'table_one':
            return TableOneListUpdate(**v)
        elif table_name == 'table_two':
            return TableTwoListUpdate(**v)
        else:
            raise ValueError('Invalid table_name')