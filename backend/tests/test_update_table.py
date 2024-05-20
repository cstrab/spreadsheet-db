from datetime import date, datetime
from fastapi.encoders import jsonable_encoder
from tests.models import UNIT_TEST_TABLE
from tests.schemas import UpdateUnitTest

def custom_encoder(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

def test_update_table_valid(client):
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


