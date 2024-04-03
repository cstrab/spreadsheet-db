# Makefile

# Database setup variables
SCRIPT = ./database/create_init.sql.sh
SCHEMA_FILE = schema.json
DATA_TYPE_MAPPING_FILE = ./database/data_type_mapping.json
DATABASE_TYPE = postgresql  # Change this to the database type you want to use i.e. mssql
OUTPUT_FILE = ../database/generated_init.sql  

# Default target
all: 
	@chmod +x $(SCRIPT)
	@./$(SCRIPT) $(SCHEMA_FILE) $(DATA_TYPE_MAPPING_FILE) $(DATABASE_TYPE) $(OUTPUT_FILE) 
