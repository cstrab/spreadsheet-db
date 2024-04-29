# Makefile

# Schema
SCHEMA = schema.json

# Database setup variables
# init.sql
DB_INIT_SCRIPT = ./database/create_init.sql.sh
DB_DATA_TYPE_MAPPING = ./database/database_type_mapping.json
DB_TYPE = postgresql  # Change this to the database type you want to use i.e. mssql
DB_OUTPUT = ../database/init.sql

# Backend setup variables
# mapping.py
BE_MAPPINGS_SCRIPT = ./backend/create_mappings.py.sh
BE_MAPPINGS_OUTPUT = ../backend/models/mappings.py

# models.py
BE_MODELS_SCRIPT = ./backend/create_models.py.sh
BE_DATA_TYPE_MAPPING = ./backend/data_type_mapping.json
BE_DATABASE_MAPPING = ./backend/database_mapping.json
BE_MODELS_OUTPUT = ../backend/models/models.py

# schemas.py
BE_SCHEMAS_SCRIPT = ./backend/create_schemas.py.sh
BE_SCHEMAS_OUTPUT = ../backend/models/schemas.py

# Frontend setup variables
# App.tsx
FE_APP_SCRIPT = ./frontend/create_App.tsx.sh
FE_APP_OUTPUT = ../frontend/src/App.tsx

# Header.tsx
FE_HEADER_SCRIPT = ./frontend/create_Header.tsx.sh
FE_HEADER_OUTPUT = ../frontend/src/components/common/Header.tsx

.PHONY: all database backend frontend clean

all: clean database backend frontend

clean:
	@rm -f $(DB_OUTPUT)
	@rm -f $(BE_MAPPINGS_OUTPUT)

database: 
	@chmod +x $(DB_INIT_SCRIPT)
	@./$(DB_INIT_SCRIPT) $(SCHEMA) $(DB_DATA_TYPE_MAPPING) $(DB_TYPE) $(DB_OUTPUT)

backend:
	@chmod +x $(BE_MAPPINGS_SCRIPT)
	@./$(BE_MAPPINGS_SCRIPT) $(SCHEMA) $(BE_MAPPINGS_OUTPUT)
	@chmod +x $(BE_MODELS_SCRIPT)
	@./$(BE_MODELS_SCRIPT) $(SCHEMA) $(BE_DATA_TYPE_MAPPING) $(BE_MODELS_OUTPUT) $(DB_TYPE) $(BE_DATABASE_MAPPING)
	@chmod +x $(BE_SCHEMAS_SCRIPT)
	@./$(BE_SCHEMAS_SCRIPT) $(SCHEMA) $(BE_SCHEMAS_OUTPUT) 

frontend:
	@chmod +x $(FE_APP_SCRIPT)
	@./$(FE_APP_SCRIPT) $(SCHEMA) $(FE_APP_OUTPUT)
	@chmod +x $(FE_HEADER_SCRIPT)
	@./$(FE_HEADER_SCRIPT) $(SCHEMA) $(FE_HEADER_OUTPUT)