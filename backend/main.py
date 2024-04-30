from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from models.schemas import Update, BulkUpdate
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING
from models.models import SCHEMA_NAME
from utils.database import get_db
from utils.logger import setup_logger

logger = setup_logger('backend')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/read")
def read_table(
    table_name: str = Query(..., description="Name of the table"),
    limit: int = Query(150000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    ):
    logger.info("Executing /read endpoint for table: " + table_name)
    
    logger.info(f"Checking if table {table_name} is in mappings and defining model and schema")
    if table_name in TABLE_MODEL_MAPPING and table_name in TABLE_SCHEMA_MAPPING:
        model = TABLE_MODEL_MAPPING[table_name]
        schema = TABLE_SCHEMA_MAPPING[table_name]["read"]
    else:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")
    
    logger.info(f"Querying database for table: {table_name}")
    query = db.query(model).limit(limit)
    items = (schema(**item.__dict__) for item in query) 

    columns = [{"name": column.name, "type": str(column.type).lower()} for column in model.__table__.columns]
    result = list(items)  

    logger.info(f"Returning columns and data for table: {table_name}")
    return {"columns": columns, "data": result}

@app.patch("/update")
async def update_table(request: Update, db: Session = Depends(get_db)):
    table_name = request.table_name
    updates = request.updates
    removed_row_ids = request.removed_row_ids

    logger.info(f"Executing /update endpoint for table: {table_name}")

    if table_name not in TABLE_MODEL_MAPPING:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    model = TABLE_MODEL_MAPPING[table_name]
    schema = TABLE_SCHEMA_MAPPING[table_name]["update"]

    for row_id in removed_row_ids:
        db_item = db.query(model).filter(model.id == row_id).first()
        if db_item:
            db.delete(db_item)
            logger.info(f"Deleted item with id {row_id} from table: {table_name}")
        else:
            logger.error(f"Item with id {row_id} not found")
            raise HTTPException(status_code=404, detail=f"Item with id {row_id} not found")

    updated_ids = []  
    for update_instance in updates.data:
        update_dict = update_instance.dict(exclude_unset=True)
        item_id = update_dict.pop("id", None)  

        try:
            validated_data = schema(**update_dict)
        except ValueError as e:
            logger.error(f"Invalid update data: {update_dict}, error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid update data: {update_dict}, error: {str(e)}")

        if item_id is not None and item_id < 0:  
            db_item = model(**validated_data.dict())
            db.add(db_item)
            db.flush()  
            updated_ids.append({"tempId": item_id, "dbId": db_item.id})
        elif item_id is not None:
            db_item = db.query(model).filter(model.id == item_id).first()
            if not db_item:
                logger.error(f"Item with id {item_id} not found")
                raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")
            for key, value in validated_data.dict(exclude_unset=True).items():
                setattr(db_item, key, value)

    db.commit()
    logger.info(f"Committing changes to the database")

    return {"message": "Update successful", "updated_ids": updated_ids}

@app.put("/bulk-update")
async def bulk_update_table(request: BulkUpdate, db: Session = Depends(get_db)):
    table_name = request.table_name
    updates = request.updates.data

    logger.info(f"Executing /bulk-update endpoint for table: {table_name}")

    if table_name not in TABLE_MODEL_MAPPING:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    model = TABLE_MODEL_MAPPING[table_name]

    try:
        logger.info(f"Clearing all entries from table: {table_name}")
        db.query(model).delete()

        # TODO: Move this to a separate file since it depends on the database type
        # PostgreSQL-specific sequence reset
        sequence_name = f"{SCHEMA_NAME}.{table_name}_id_seq"
        db.execute(text(f"ALTER SEQUENCE {sequence_name} RESTART WITH 1"))

        # # MSSQL-specific identity reset
        # db.execute(text(f"DBCC CHECKIDENT ('{table_name}', RESEED, 0)"))

        for update_instance in updates:
            update_dict = update_instance.dict(exclude={'id'}) 
            db_item = model(**update_dict)
            db.add(db_item)

        db.commit()
        logger.info(f"Successfully updated table {table_name} with new data")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update table {table_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update data")

    return {"message": "Bulk update successful"}
