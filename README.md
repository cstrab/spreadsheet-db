# spreadsheet-db

Stack:
- Frontend: React.js
    - Noteable packages: AG Grid
- Backend: Python
    - Noteable packages: FastAPI, SQLAlchemy
- Database: PostresSQL or MSSQL

CI/CD:
- Github Actions or Gitlab CI
- ArgoCD

Deployment:
- Kubernetes

# Roadmap
## Phase 1:

Goal: Application that simulates an excel-like grid displaying contents of a multiple database tables allowing users to edit/update

Stage: POC (Proof of Concept) - The app will be considered POC after this phase. Breaking changes are expected and more frequent during this phase. Unit test coverage is recommended, but there are no coverage requirements.

- [x] Frontend:
    - [x] Common component for displaying/editing database tables utilizing backend endpoints in excel-like grid format
    - [x] Import .csv feature to bulk update database tables
    - [x] Basic logging
    - [x] Dockerfile
- [x] Backend: 
    - [x] FastAPI with endpoints for /read, /update, and /bulk-update applicable to all tables
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

Current Limitations:
- Works only for a single schema that will contain all tables
- Only PostgresSQL database type has been tested
- Dockerfiles and docker-compose.yml are not automated by Makefile setup
- Handling for datatypes other than int and string in progress (float, bool, date, and datetime)