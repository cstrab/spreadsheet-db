from typing import List, Optional, Union, Any, Dict, Type
from datetime import date, datetime

from pydantic import BaseModel, validator, ValidationError

from utils.logger import setup_logger


logger = setup_logger('backend')

# Schemas for SampleTable
class SampleTableBase(BaseModel):
    string_column: Optional[str]
    int_column: Optional[int]
    float_column: Optional[float]
    bool_column: Optional[bool]
    date_column: Optional[date]
    datetime_column: Optional[datetime]

class SampleTableUpdate(BaseModel):
    id: Optional[int] = None
    string_column: Optional[str] = None
    int_column: Optional[int] = None
    float_column: Optional[float] = None
    bool_column: Optional[bool] = None
    date_column: Optional[date] = None
    datetime_column: Optional[datetime] = None

class SampleTableRead(SampleTableBase):
    id: int

class SampleTableListUpdate(BaseModel):
    data: List[SampleTableUpdate]

# Schemas for MaterialMaster
class MaterialMasterBase(BaseModel):
    plant: Optional[str]
    material: Optional[str]
    description: Optional[str]
    flashpoint: Optional[int]
    is_automation_possible: Optional[str]
    low_flashpoint: Optional[str]
    crystal: Optional[str]
    crystalizes: Optional[str]
    citrus: Optional[str]
    refrigerate: Optional[str]
    nitrogen: Optional[str]
    heated: Optional[str]
    difficult_heat: Optional[str]
    mix_well: Optional[str]
    viscous: Optional[str]
    slightly_viscous: Optional[str]
    solid: Optional[str]
    solidifies: Optional[str]
    separates: Optional[str]
    stench: Optional[str]
    moss_oleo_resins: Optional[str]
    wax: Optional[str]
    special_handling: Optional[str]
    plastic_storage: Optional[str]
    supply_issue: Optional[str]
    phantom: Optional[str]
    additional_comments: Optional[str]

class MaterialMasterUpdate(BaseModel):
    id: Optional[int] = None
    plant: Optional[str] = None
    material: Optional[str] = None
    description: Optional[str] = None
    flashpoint: Optional[int] = None
    is_automation_possible: Optional[str] = None
    low_flashpoint: Optional[str] = None
    crystal: Optional[str] = None
    crystalizes: Optional[str] = None
    citrus: Optional[str] = None
    refrigerate: Optional[str] = None
    nitrogen: Optional[str] = None
    heated: Optional[str] = None
    difficult_heat: Optional[str] = None
    mix_well: Optional[str] = None
    viscous: Optional[str] = None
    slightly_viscous: Optional[str] = None
    solid: Optional[str] = None
    solidifies: Optional[str] = None
    separates: Optional[str] = None
    stench: Optional[str] = None
    moss_oleo_resins: Optional[str] = None
    wax: Optional[str] = None
    special_handling: Optional[str] = None
    plastic_storage: Optional[str] = None
    supply_issue: Optional[str] = None
    phantom: Optional[str] = None
    additional_comments: Optional[str] = None

class MaterialMasterRead(MaterialMasterBase):
    id: int

class MaterialMasterListUpdate(BaseModel):
    data: List[MaterialMasterUpdate]

# Schema for read operations
class Read(BaseModel):
    table_name: str
    skip: int = 0
    limit: int = 150000

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
        SampleTableListUpdate,
        MaterialMasterListUpdate,
    ]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        logger.info(f"Validating bulk updates for table: {table_name}")
        return validate_update_data(v, table_name, {
            'sample_table': SampleTableListUpdate,
            'material_master': MaterialMasterListUpdate,
        })

# Schema for update operations
class Update(BulkUpdate):
    removed_row_ids: List[int]
