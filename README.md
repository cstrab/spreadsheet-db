# spreadsheet-db

An application allowing users to perform CRUD (Create, Read, Update, and Delete) operations on relational database tables through an excel-like user interface

![Example](setup/sample_data/sample.gif)

Stack:
- Frontend: React.js
    - Noteable packages: AG Grid
- Backend: Python
    - Noteable packages: FastAPI, SQLAlchemy, Pydantic
- Database: PostresSQL or MSSQL


CI/CD:
- Github Actions or Gitlab CI
- ArgoCD


Deployment:
- Kubernetes


# High-level Architecture

![Architecture Diagram](setup/sample_data/architecture-diagram.png)


# Local Deployment

Requirements: 
- Install Docker Desktop (https://www.docker.com/products/docker-desktop/)


Step 1:
- Update spreadsheet-db/setup/schema.json file with desired table structure
    - Note: Must have "id" column with data_type "int_id" for each table
    - Note: Currently only supports single schema
    - Note: Fields 'schema_name' and 'column_name' must use '_' if spacing is required
    - Note: Current 'data_type' options: 'int_id', 'int', 'float', 'str', 'bool', 'date', 'datetime'
    - Note: Keep all naming conventions lowercase as seen in example


Example: 
```
{
    "schema_name": "test_schema",
    "tables": [
        {
            "table_name": "table_one",
            "columns": [
                {
                    "column_name": "id",
                    "data_type": "int_id"
                },
                {
                    "column_name": "name",
                    "data_type": "str"
                },
                {
                    "column_name": "description",
                    "data_type": "str"
                }
            ]
        },
        {
            "table_name": "table_two",
            "columns": [
                {
                    "column_name": "id",
                    "data_type": "int_id"
                },
                {
                    "column_name": "title",
                    "data_type": "str"
                },
                {
                    "column_name": "details",
                    "data_type": "str"
                },
                {
                    "column_name": "category",
                    "data_type": "str"
                }
            ]
        }
    ]
}
```
    

Step 2:
- cd into spreadsheet-db/setup folder and run the following command:
    - Note: This will build all Frontend, Backend, and Database files based off of the schema.json input
    - Note: Do not proceed to Step 3: until container creates and exits successfully
    - Note: If you are using Windows, make sure that default EOL for .sh files it set to LF


```
docker compose build --no-cache
```

```
docker compose up -d
```


Step 3: 
- cd into spreadsheet-db root directory and run the following commands:

```
docker compose build --no-cache
```

```
docker compose up -d
```


Step 4: 
- Navigate to [localhost:3000](http://localhost:3000)


Optional:
- To stop and clear database volume for the application run the following in the spreadsheet-db root directory:

```
docker compose down -v
```

Sample Data:
- Sample data is provided in the spreadsheet-db/setup/data folder
    - Note: Data must be in .xlsx format and headers must match what is defined in the schema.json file


# Roadmap
## Phase 1:

Goal: Basic functionality


Stage: POC (Proof of Concept) - The app will be considered POC after this phase. Breaking changes are expected and more frequent during this phase. Unit test coverage is recommended, but there are no coverage requirements.


- [x] Frontend:
    - [x] Common component for displaying/editing database tables utilizing backend endpoints in excel-like grid format
    - [x] Import .xlsx feature to bulk update database tables
    - [x] Data type validation
    - [x] Basic logging
    - [x] Dockerfile
- [x] Backend: 
    - [x] FastAPI with endpoints for /read, /update, and /bulk-update applicable to all tables
    - [x] Data type validation
    - [x] Basic logging
    - [x] Dockerfile
- [x] Database: 
    - [x] Basic Postgresql local setup with initialization .sql script
- [x] Setup:
    - [x] Makefile and .sh script files for dynamically generating Frontend, Backend, Database files at project start up
- [x] Local Testing:
    - [x] Setup docker-compose for local testing
- [x] CI/CD: No requirements
- [x] Deployment: No requirements
- [x] General: No requirements

- [x] Evaluation of POC:
    - Current Limitations:
        - Large data tables may experience slow bulk update and read times 
            - Tested with 150k row data, xlsx import / UI render (3s), update (negligible), bulk update (60s), read (10s)
        - Works only for a single schema that will contain all tables
        - Only PostgresSQL database type has been tested
        - Dockerfiles and docker-compose.yml are not automated by Makefile setup



## Phase 2:

Goal: Code refactoring and optimizations


Stage: Refactoring - Breaking changes are expected, but less frequent during this phase. Unit test coverage is recommended, but there are no coverage requirements. Internal code review is required at the end of this stage.


- [x] Frontend:
    - [x] useGrid.ts - update handleUpdate bulkUpdateData case to predict backend ids after update (i.e. start from id=1 always since we will reset id count for the table), this will improve bulk update performance
    - [x] General - Add navigation bar with custom asset symbol and version number
    - [x] General - Incorporate links into navigation bar, main side link "Tables" with dropdown for table list
    - [x] useGrid.ts - Light cleanup of UI and styling
    - [x] General - Display count of row entries under the AGGrid component
- [ ] Backend:
    - [ ] main.py - For bulk-update need to reset ids after database table is cleared, but this syntax is database dependent (i.e. postgres .vs MSSQL, so need have a mapping for this)
    - [ ] dao.py - Implement custom DAO for each data table 
    - [x] main.py - Change /read to a GET request instead of POST and pass table_name as parameter
    - [x] main.py - Change /update to a PATCH request instead of POST since is a partial update
    - [x] main.py - Change /bulk-update to a PUT request instead of POST since is a full update
    - [ ] main.py - Create schema for response of each endpoint (i.e. /read and /update since they return data)
    - [ ] main.py - Fix bug where if in middle of /bulk-update or /read and exit page request continues
- [x] Database: No Requirements
- [ ] Setup:
    - [ ] Update .sh files to incorporate any Frontend/Backend changes, may need to put the ID reset as part of shell script by
passing the database type and then using the correct query statement in dao.py
- [ ] Local Testing:
    - [ ] Combine local testing steps to a single docker-compose file, must allow for time for setup to run before starting the app
- [x] CI/CD: No requirements
- [x] Deployment: No requirements
- [x] General: 
    - [x] High-level architecture diagram
    - [ ] Update sample.gif demo

- [ ] Internal Code Review: 
    - Current Limitations/Feedback:



## Phase 3: 

Goal: Deployment and UAT (User Acceptance Testing) in DEV environment


Stage: MVP (Minimum Viable Product) - The app will be considered MVP after this phase. Breaking changes are expected and more frequent during this phase. Unit test coverage is recommended, but there are no coverage requirements. Deployment to DEV environment and feedback collection is required.


- [ ] Frontend:
- [ ] Backend:
- [ ] Database:
- [ ] Setup:
- [ ] Local Testing:
- [ ] CI/CD: 
- [ ] Deployment:
- [ ] General:


- [ ] Evaluation of MVP:
    - Current Limitations/Feedback:



## Phase 4: 

Goal: Initial release in PROD environment


Stage: Version 1.0 Release - The app with be considered Version 1.0 after this phase. Breaking changes are not expected during this phase, but will be flagged as bugs to resolve if occured. Unit test coverage is required (80%) for Frontend and Backend. Deployment to PROD environment is required.


- [ ] Frontend:
- [ ] Backend:
- [ ] Database:
- [ ] Setup:
- [ ] Local Testing:
- [ ] CI/CD: 
- [ ] Deployment:
- [ ] General:


- [ ] Evaluation of Version 1.0:
    - Bugs:



## Backlog: 

- [ ] Frontend:
    - [ ] General - New main componenet or modified GenericGrid.tsx that has read-only capability, should just display table data from a database but not allow edit/update
    - [ ] gridInterfaces.ts - Update RowData interface from 'any' to possible schemas for each table
    - [ ] apiInterfaces.ts - Update interfaces from 'any' to possible schemas for each table
    - [ ] useGrid.ts - Consider further refactor of rowHandling functions and possible define cell type mapping in a separate file
    - [ ] useGrid.ts - Update alert statements to modals 
    - [ ] General - Use theme config
    - [ ] General - Additional error handling and logging
- [ ] Backend:
    - [ ] main.py - Troubleshoot why from_orm sqlalchemy does not work
    - [ ] General - Additional error handling and logging
    - [ ] dao.py - Implement table read-only table query for Snowflake data extraction
- [ ] Database:
- [ ] Setup:
    - [ ] General - Consider replacing .sh scripts with python scripts
    - [ ] General - Allow for multiple schemas
    - [ ] General - Consider using FlatBuffers for serialization
- [ ] Local Testing:
- [ ] CI/CD: 
- [ ] Deployment:
- [ ] General: