from datetime import date, datetime
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
import pytest

from tests.models import UNIT_TEST_TABLE
from tests.schemas import UpdateUnitTest

def custom_encoder(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

def test_update_table_update_record(client):
    """
    Test case for updating a table with valid data.
    """
    payload = UpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": [
                {
                    "id": 1,
                    "string_column": "UpdatedTest1",
                    "int_column": 15,
                    "float_column": 11.0,
                    "bool_column": False,
                    "date_column": "2024-01-01",
                    "datetime_column": "2024-01-01T00:00:00Z" 
                }
            ]
        },
        removed_row_ids=[]
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.patch("/update", json=payload_dict)
    assert response.status_code == 200

def test_update_table_multiple_records(client):
    """
    Test case for updating multiple records in a table with valid data.
    """
    payload = UpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": [
                {
                    "id": 1,
                    "string_column": "UpdatedTestMultiple1",
                    "int_column": 15,
                    "float_column": 11.0,
                    "bool_column": False,
                    "date_column": "2024-01-01",
                    "datetime_column": "2024-01-01T00:00:00Z"
                },
                {
                    "id": 2,
                    "string_column": "UpdatedTestMultiple1",
                    "int_column": 16,
                    "float_column": 12.0,
                    "bool_column": True,
                    "date_column": "2024-02-02",
                    "datetime_column": "2024-02-02T00:00:00Z"
                }
            ]
        },
        removed_row_ids=[]
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.patch("/update", json=payload_dict)
    assert response.status_code == 200

def test_update_table_add_record(client):
    """
    Test case for adding a record to a table with valid data.
    """
    payload = UpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": [
                {
                    "id": -1, 
                    "string_column": "NewRecord",
                    "int_column": 3,
                    "float_column": 3.0,
                    "bool_column": True,
                    "date_column": "2025-03-03",
                    "datetime_column": "2025-03-03T00:00:00Z"
                }
            ]
        },
        removed_row_ids=[]
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.patch("/update", json=payload_dict)
    assert response.status_code == 200
    assert response.json()["updated_ids"][0]["tempId"] == -1

def test_update_table_remove_record(client):
    """
    Test case for removing a record from a table.
    """
    payload = UpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": []
        },
        removed_row_ids=[1]
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.patch("/update", json=payload_dict)
    assert response.status_code == 200

def test_update_table_nonexistent_record(client):
    """
    Test case for updating a nonexistent record in a table.
    An error should be returned."""
    payload = UpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": [
                {
                    "id": 9999,
                    "string_column": "UpdatedTest1",
                    "int_column": 15,
                    "float_column": 11.0,
                    "bool_column": False,
                    "date_column": "2024-01-01",
                    "datetime_column": "2024-01-01T00:00:00Z"
                }
            ]
        },
        removed_row_ids=[]
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.patch("/update", json=payload_dict)
    assert response.status_code == 404 

def test_update_table_invalid_table(client):
    """
    Test case for updating a nonexistent table.
    A validation error should be returned.
    """
    with pytest.raises(ValidationError) as exc_info:
        payload = UpdateUnitTest(
            table_name="nonexistent_table",
            updates={
                "data": [
                    {
                        "id": 1,
                        "string_column": "UpdatedTest1",
                        "int_column": 15,
                        "float_column": 11.0,
                        "bool_column": False,
                        "date_column": "2024-01-01",
                        "datetime_column": "2024-01-01T00:00:00Z"
                    }
                ]
            },
            removed_row_ids=[]
        )
    assert "Table not found in mappings: nonexistent_table" in str(exc_info.value)
