from fastapi import FastAPI, HTTPException, Request, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from models.schemas import Update, BulkUpdate
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING, reset_db_sequence
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
async def read_table(
    table_name: str = Query(..., description="Name of the table"),
    limit: int = Query(150000, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
) -> dict:
    """
    Retrieve all data from the specified table.

    Args:
        table_name (str) - Query Parameter: Name of the table.
        limit (int) - Query Parameter: Maximum number of records to return.

    Returns:
        response (dict): Dictionary containing columns (list of column names and data type) and data (list of table records in Pydantic schema format).
    """
    logger.info(f"Executing /read endpoint for table: {table_name}")

    if table_name in TABLE_MODEL_MAPPING and table_name in TABLE_SCHEMA_MAPPING:
        model = TABLE_MODEL_MAPPING[table_name]
        schema = TABLE_SCHEMA_MAPPING[table_name]["read"]
    else:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    logger.info(f"Querying database for table: {table_name}")
    query = db.query(model).limit(limit)
    
    result = [schema(**item.__dict__) for item in query]
    columns = [{"name": column.name, "type": str(column.type).lower()} for column in model.__table__.columns]

    logger.info(f"Returning columns and data for table: {table_name}")

    response = {"columns": columns, "data": result}
    return response


@app.patch("/update")
async def update_table(
    request: Request,
    payload: Update, 
    db: Session = Depends(get_db)
) -> dict:
    """
    Update specific records in the specified table.

    Args:
        payload (Update): Update payload containing table name, updates, and removed row IDs.

    Returns:
        response (dict): Dictionary containg a mapping list of tempIds to updated dbIds.
    """
    table_name = payload.table_name
    updates = payload.updates.data
    removed_row_ids = payload.removed_row_ids

    logger.info(f"Executing /update endpoint for table: {table_name}")

    if table_name in TABLE_MODEL_MAPPING and table_name in TABLE_SCHEMA_MAPPING:
        model = TABLE_MODEL_MAPPING[table_name]
        schema = TABLE_SCHEMA_MAPPING[table_name]["update"]
    else:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    for row_id in removed_row_ids:
        db_item = db.query(model).filter(model.id == row_id).first()
        if db_item:
            db.delete(db_item)
            logger.info(f"Deleted item with id {row_id} from table: {table_name}")
        else:
            logger.error(f"Item with id {row_id} not found")
            raise HTTPException(status_code=404, detail=f"Item with id {row_id} not found")

    updated_ids = []  
    for update_instance in updates:
        if await request.is_disconnected():
                logger.info("Client disconnected, rolling back transaction")
                db.rollback()
                return HTTPException(status_code=499, detail="Client disconnected")
        
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

    response = {"updated_ids": updated_ids}
    return response


@app.put("/bulk-update")
async def bulk_update_table(
    request: Request,
    payload: BulkUpdate, 
    db: Session = Depends(get_db)
) -> None:
    """
    Bulk update records in the specified table.

    Args:
        payload (BulkUpdate): Bulk update payload containing table name and updates.

    Returns:
        None
    """
    table_name = payload.table_name
    updates = payload.updates.data

    logger.info(f"Executing /bulk-update endpoint for table: {table_name}")

    if table_name not in TABLE_MODEL_MAPPING:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    model = TABLE_MODEL_MAPPING[table_name]

    try:
        logger.info(f"Clearing all entries from table: {table_name}")
        db.query(model).delete()

        logger.info(f"Resetting sequence for table: {table_name}")
        reset_db_sequence(db, table_name, SCHEMA_NAME)

        for update_instance in updates:
            if await request.is_disconnected():
                logger.info("Client disconnected, rolling back transaction")
                db.rollback()
                return HTTPException(status_code=499, detail="Client disconnected")
            
            update_dict = update_instance.dict(exclude={'id'}) 
            db_item = model(**update_dict)
            db.add(db_item)

        db.commit()
        logger.info(f"Successfully updated table {table_name} with new data")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update table {table_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update data")

    return None
