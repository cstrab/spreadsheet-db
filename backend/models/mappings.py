from typing import Dict, Type, Any

from models.models import Base, SampleTable, MaterialMaster
from models.schemas import (
    SampleTableRead, SampleTableUpdate, SampleTableListUpdate, 
    MaterialMasterRead, MaterialMasterUpdate, MaterialMasterListUpdate, 
)


TABLE_MODEL_MAPPING: Dict[str, Type[Base]] = {
    "sample_table": SampleTable,
    "material_master": MaterialMaster,
}

TABLE_SCHEMA_MAPPING: Dict[str, Dict[str, Any]] = {
    "sample_table": {
        "read": SampleTableRead,
        "update": SampleTableUpdate,
        "list_update": SampleTableListUpdate,
    },
    "material_master": {
        "read": MaterialMasterRead,
        "update": MaterialMasterUpdate,
        "list_update": MaterialMasterListUpdate,
    },
}
