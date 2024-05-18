import pytest
from conftest import UNIT_TEST_TABLE

def test_read_table(client):
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE, "limit": 10})
    assert response.status_code == 200
    data = response.json()
    assert "columns" in data
    assert "data" in data
    assert len(data["data"]) == 2
    assert data["data"][0]["first_name"] == "John"
    assert data["data"][1]["first_name"] == "Jane"
