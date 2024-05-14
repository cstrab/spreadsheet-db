from typing import Dict, Type, Any
from sqlalchemy import text

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

def reset_db_sequence(db, table_name, schema_name)-> None:
    sequence_name = f"{schema_name}.{table_name}_id_seq"
    db.execute(text(f"ALTER SEQUENCE {sequence_name} RESTART WITH 1"))
