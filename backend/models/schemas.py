from typing import List, Optional, Union, Any, Dict, Type
from datetime import date, datetime

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
    bool_column: Optional[bool]
    date_column: Optional[date]
    datetime_column: Optional[datetime]

class TableThreeUpdate(BaseModel):
    id: Optional[int] = None
    string_column: Optional[str] = None
    int_column: Optional[int] = None
    float_column: Optional[float] = None
    bool_column: Optional[bool] = None
    date_column: Optional[date] = None
    datetime_column: Optional[datetime] = None

class TableThreeRead(TableThreeBase):
    id: int

class TableThreeListUpdate(BaseModel):
    data: List[TableThreeUpdate]

# Schemas for BinMaster
class BinMasterBase(BaseModel):
    storage_type: Optional[str]
    storage_bin: Optional[str]
    phase_number: Optional[str]
    phase_name: Optional[str]
    bin_class: Optional[str]
    bin_feature: Optional[str]
    reservoir_qty_kg: Optional[float]
    primary_pouring_point: Optional[str]
    secondary_pouring_point: Optional[str]
    filling_point: Optional[str]
    if_in_manual: Optional[str]
    if_in_cdl: Optional[str]
    cdl_drop_number: Optional[str]
    if_in_cluster: Optional[str]
    cluster_drop_number: Optional[str]
    if_in_bulk: Optional[str]
    bulk_drop_number: Optional[str]
    if_in_kardex: Optional[str]
    if_in_hcsd: Optional[str]
    hcsd_drop_number: Optional[str]
    if_in_sds: Optional[str]
    sds_drop_number: Optional[str]
    comment: Optional[str]

class BinMasterUpdate(BaseModel):
    id: Optional[int] = None
    storage_type: Optional[str] = None
    storage_bin: Optional[str] = None
    phase_number: Optional[str] = None
    phase_name: Optional[str] = None
    bin_class: Optional[str] = None
    bin_feature: Optional[str] = None
    reservoir_qty_kg: Optional[float] = None
    primary_pouring_point: Optional[str] = None
    secondary_pouring_point: Optional[str] = None
    filling_point: Optional[str] = None
    if_in_manual: Optional[str] = None
    if_in_cdl: Optional[str] = None
    cdl_drop_number: Optional[str] = None
    if_in_cluster: Optional[str] = None
    cluster_drop_number: Optional[str] = None
    if_in_bulk: Optional[str] = None
    bulk_drop_number: Optional[str] = None
    if_in_kardex: Optional[str] = None
    if_in_hcsd: Optional[str] = None
    hcsd_drop_number: Optional[str] = None
    if_in_sds: Optional[str] = None
    sds_drop_number: Optional[str] = None
    comment: Optional[str] = None

class BinMasterRead(BinMasterBase):
    id: int

class BinMasterListUpdate(BaseModel):
    data: List[BinMasterUpdate]

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
        TableOneListUpdate,
        TableTwoListUpdate,
        TableThreeListUpdate,
        BinMasterListUpdate,
        MaterialMasterListUpdate,
    ]

    @validator('updates', pre=True)
    def set_updates(cls, v, values):
        table_name = values.get('table_name')
        logger.info(f"Validating bulk updates for table: {table_name}")
        return validate_update_data(v, table_name, {
            'table_one': TableOneListUpdate,
            'table_two': TableTwoListUpdate,
            'table_three': TableThreeListUpdate,
            'bin_master': BinMasterListUpdate,
            'material_master': MaterialMasterListUpdate,
        })

# Schema for update operations
class Update(BulkUpdate):
    removed_row_ids: List[int]
