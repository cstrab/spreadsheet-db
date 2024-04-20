from typing import Dict, Type, Any

from models.models import Base, SampleTable
from models.schemas import (
    SampleTableRead, SampleTableUpdate, SampleTableListUpdate, 
)


TABLE_MODEL_MAPPING: Dict[str, Type[Base]] = {
    "sample_table": SampleTable,
}

TABLE_SCHEMA_MAPPING: Dict[str, Dict[str, Any]] = {
    "sample_table": {
        "read": SampleTableRead,
        "update": SampleTableUpdate,
        "list_update": SampleTableListUpdate,
    },
}
