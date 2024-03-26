from typing import Dict, Type, Any
from models.models import Base, TableOne, TableTwo
from models.schemas import (
    TableOneRead, TableOneUpdate, TableOneListUpdate, 
    TableTwoRead, TableTwoUpdate, TableTwoListUpdate
)


TABLE_MODEL_MAPPING: Dict[str, Type[Base]] = {
    "table_one": TableOne,
    "table_two": TableTwo,
}

TABLE_SCHEMA_MAPPING: Dict[str, Dict[str, Any]] = {
    "table_one": {
        "read": TableOneRead,
        "update": TableOneUpdate,
        "list_update": TableOneListUpdate,
    },
    "table_two": {
        "read": TableTwoRead,
        "update": TableTwoUpdate,
        "list_update": TableTwoListUpdate,
    },
}