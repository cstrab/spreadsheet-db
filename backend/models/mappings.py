from typing import Dict, Type, Any
from sqlalchemy import text

from models.models import Base, SampleTableTypes, SampleTableUsers
from models.schemas import (
    SampleTableTypesRead, SampleTableTypesUpdate, SampleTableTypesListUpdate, 
    SampleTableUsersRead, SampleTableUsersUpdate, SampleTableUsersListUpdate, 
)


TABLE_MODEL_MAPPING: Dict[str, Type[Base]] = {
    "sample_table_types": SampleTableTypes,
    "sample_table_users": SampleTableUsers,
}

TABLE_SCHEMA_MAPPING: Dict[str, Dict[str, Any]] = {
    "sample_table_types": {
        "read": SampleTableTypesRead,
        "update": SampleTableTypesUpdate,
        "list_update": SampleTableTypesListUpdate,
    },
    "sample_table_users": {
        "read": SampleTableUsersRead,
        "update": SampleTableUsersUpdate,
        "list_update": SampleTableUsersListUpdate,
    },
}

def reset_db_sequence(db, table_name, schema_name)-> None:
    sequence_name = f"{schema_name}.{table_name}_id_seq"
    db.execute(text(f"ALTER SEQUENCE {sequence_name} RESTART WITH 1"))
