from datetime import date, datetime
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
import pytest

from tests.test_update_table import custom_encoder
from tests.models import UNIT_TEST_TABLE
from tests.schemas import BulkUpdateUnitTest

def test_bulk_update_table_update_records(client):
    """
    Test case for bulk updating a table with valid data.
    """
    payload = BulkUpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": [
                {
                    "string_column": "BulkUpdateTest1",
                    "int_column": 15,
                    "float_column": 11.0,
                    "bool_column": False,
                    "date_column": "2024-01-01",
                    "datetime_column": "2024-01-01T00:00:00Z"
                },
                {
                    "string_column": "BulkUpdateTest2",
                    "int_column": 16,
                    "float_column": 12.0,
                    "bool_column": True,
                    "date_column": "2024-02-02",
                    "datetime_column": "2024-02-02T00:00:00Z"
                }
            ]
        }
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.put("/bulk-update", json=payload_dict)
    assert response.status_code == 200

def test_bulk_update_table_invalid_table(client):
    """
    Test case for bulk updating a nonexistent table.
    A validation error should be returned.
    """
    with pytest.raises(ValidationError) as exc_info:
        payload = BulkUpdateUnitTest(
            table_name="nonexistent_table",
            updates={
                "data": [
                    {
                        "string_column": "BulkUpdateTest1",
                        "int_column": 15,
                        "float_column": 11.0,
                        "bool_column": False,
                        "date_column": "2024-01-01",
                        "datetime_column": "2024-01-01T00:00:00Z"
                    }
                ]
            }
        )
    assert "Table not found in mappings: nonexistent_table" in str(exc_info.value)

def test_bulk_update_table_empty_data(client):
    """
    Test case for bulk updating a table with empty data.
    The table should be cleared.
    """
    payload = BulkUpdateUnitTest(
        table_name=UNIT_TEST_TABLE,
        updates={
            "data": []
        }
    )
    payload_dict = jsonable_encoder(payload, by_alias=True, custom_encoder={date: custom_encoder, datetime: custom_encoder})
    response = client.put("/bulk-update", json=payload_dict)
    assert response.status_code == 200
