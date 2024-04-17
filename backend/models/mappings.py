from typing import Dict, Type, Any

from models.models import Base, TableOne, TableTwo, TableThree, BinMaster, MaterialMaster
from models.schemas import (
    TableOneRead, TableOneUpdate, TableOneListUpdate, 
    TableTwoRead, TableTwoUpdate, TableTwoListUpdate, 
    TableThreeRead, TableThreeUpdate, TableThreeListUpdate, 
    BinMasterRead, BinMasterUpdate, BinMasterListUpdate, 
    MaterialMasterRead, MaterialMasterUpdate, MaterialMasterListUpdate, 
)


TABLE_MODEL_MAPPING: Dict[str, Type[Base]] = {
    "table_one": TableOne,
    "table_two": TableTwo,
    "table_three": TableThree,
    "bin_master": BinMaster,
    "material_master": MaterialMaster,
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
    "table_three": {
        "read": TableThreeRead,
        "update": TableThreeUpdate,
        "list_update": TableThreeListUpdate,
    },
    "bin_master": {
        "read": BinMasterRead,
        "update": BinMasterUpdate,
        "list_update": BinMasterListUpdate,
    },
    "material_master": {
        "read": MaterialMasterRead,
        "update": MaterialMasterUpdate,
        "list_update": MaterialMasterListUpdate,
    },
}
