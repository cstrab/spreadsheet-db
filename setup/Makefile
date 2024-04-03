# Makefile

# Schema
SCHEMA = schema.json

# Database setup variables
DB_INIT_SCRIPT = ./database/create_init.sql.sh
DB_DATA_TYPE_MAPPING = ./database/data_type_mapping.json
DB_TYPE = postgresql  # Change this to the database type you want to use i.e. mssql
DB_OUTPUT = ../database/autogen_init.sql

# Backend setup variables
BE_MAPPINGS_SCRIPT = ./backend/create_mappings.py.sh
BE_MAPPINGS_OUTPUT = ../backend/models/autogen_mappings.py

.PHONY: all database backend clean

all: clean database backend

clean:
	@rm -f $(DB_OUTPUT)
	@rm -f $(BE_MAPPINGS_OUTPUT)

database: 
	@chmod +x $(DB_INIT_SCRIPT)
	@./$(DB_INIT_SCRIPT) $(SCHEMA) $(DB_DATA_TYPE_MAPPING) $(DB_TYPE) $(DB_OUTPUT)

backend:
	@chmod +x $(BE_MAPPINGS_SCRIPT)
	@./$(BE_MAPPINGS_SCRIPT) $(SCHEMA) $(BE_MAPPINGS_OUTPUT)
