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

Stage: MVP - The app will be considered Alpha after this phase. Breaking changes are expected and more frequent during this phase. Unit test coverage is recommended, but there are no coverage requirements.

- [ ] Frontend:
    - [ ] Common component for displaying/editing database tables utilizing backend endpoints in excel-like grid format
    - [ ] Basic logging
    - [x] Dockerfile
- [x] Backend: 
    - [x] FastAPI with endpoints for /read and /update applicable to all tables
    - [x] Basic logging
    - [x] Dockerfile
- [x] Database: 
    - [x] Basic Postgresql local setup with initialization .sql script
- [x] Local Testing:
    - [x] Setup docker-compose for local testing
- [x] CI/CD: No requirements
- [x] Deployment: No requirements


Issues/Bugs:

- [ ] Frontend:
    - [ ] When all rows are deleted, add row functionality does not work
- [x] Backend:
- [x] Database: