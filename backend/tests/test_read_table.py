from tests.models import UNIT_TEST_TABLE

def test_read_table_valid(client):
    """
    Test case for reading a valid table.
    The table should be read successfully.
    """
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE, "limit": 10})
    assert response.status_code == 200
    data = response.json()
    assert "columns" in data
    assert "data" in data
    assert len(data["data"]) == 2

    expected_data = [
        {
            "string_column": "Test1",
            "int_column": 1,
            "float_column": 1.0,
            "bool_column": True,
            "date_column": "2023-01-01",
            "datetime_column": "2023-01-01T00:00:00"
        },
        {
            "string_column": "Test2",
            "int_column": 2,
            "float_column": 2.0,
            "bool_column": False,
            "date_column": "2023-02-02",
            "datetime_column": "2023-02-02T00:00:00"
        }
    ]

    for i in range(len(expected_data)):
        for key, value in expected_data[i].items():
            assert data["data"][i][key] == value

def test_read_table_nonexistent(client):
    """
    Test case for reading a nonexistent table.
    An error should be returned.
    """
    response = client.get("/read", params={"table_name": "nonexistent", "limit": 10})
    assert response.status_code == 404

def test_read_table_limit(client):
    """
    Test case for reading a table with a limit of 1.
    Only one record should be returned.
    """
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE, "limit": 1})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1

def test_read_table_no_limit(client):
    """
    Test case for reading a table without specifying a limit.
    The default limit should be applied.
    """
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) <= 150000  

def test_read_table_zero_limit(client):
    """
    Test case for reading a table with a limit of zero.
    An empty data list should be returned.
    """
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE, "limit": 0})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 0

def test_read_table_negative_limit(client):
    """
    Test case for reading a table with a negative limit.
    An error should be returned.
    """
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE, "limit": -1})
    assert response.status_code == 400 

def test_read_table_large_limit(client):
    """
    Test case for reading a table with a large limit.
    The maximum limit should be applied.
    """
    response = client.get("/read", params={"table_name": UNIT_TEST_TABLE, "limit": 200000})
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) <= 150000 


