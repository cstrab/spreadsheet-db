from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import Read, Update, BulkUpdate
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING
from utils.database import get_db
from utils.logger import setup_logger

# TODO: Review with Larry, consider using DAO for database operations each table

logger = setup_logger('backend')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Change to .get() method and pass table_name as a query parameter
@app.post("/read")
def read_table(request: Read, db: Session = Depends(get_db)):
    table_name = request.table_name
    skip = request.skip
    limit = request.limit
    logger.info("Executing /read endpoint for table: " + table_name)
    
    logger.info(f"Checking if table {table_name} is in mappings and defining model and schema")
    if table_name in TABLE_MODEL_MAPPING and table_name in TABLE_SCHEMA_MAPPING:
        model = TABLE_MODEL_MAPPING[table_name]
        schema = TABLE_SCHEMA_MAPPING[table_name]["read"]
    else:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")
    
    logger.info(f"Querying database for table: {table_name}")
    items = db.query(model).offset(skip).limit(limit).all()
    logger.info(f"Retrieved {len(items)} items from the database for table: {table_name}")

    columns = [{"name": column.name, "type": str(column.type).lower()} for column in model.__table__.columns]
    result = [schema(**item.__dict__) for item in items]

    logger.info(f"Returning columns and data for table: {table_name}")
    return {"columns": columns, "data": result}

@app.post("/update")
async def update_table(request: Update, db: Session = Depends(get_db)):
    table_name = request.table_name
    updates = request.updates
    removed_row_ids = request.removed_row_ids

    logger.info(f"Executing /update endpoint for table: {table_name}")

    logger.info(f"Checking if table {table_name} is in mappings and defining model and schema")
    if table_name in TABLE_MODEL_MAPPING and table_name in TABLE_SCHEMA_MAPPING:
        model = TABLE_MODEL_MAPPING[table_name]
        schema = TABLE_SCHEMA_MAPPING[table_name]["update"]
    else:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    logger.info(f"Deleting rows from table: {table_name}")
    for row_id in removed_row_ids:
        db_item = db.query(model).filter(model.id == row_id).first()
        if db_item:
            db.delete(db_item)
            logger.info(f"Deleted item with id {row_id} from table: {table_name}")
        else:
            logger.error(f"Item with id {row_id} not found")
            raise HTTPException(status_code=404, detail=f"Item with id {row_id} not found")

    logger.info(f"Handling updated and new rows for table: {table_name}")
    for update_instance in updates.data:
        update_dict = update_instance.dict(exclude_unset=True)
        item_id = update_dict.pop("id", None)

        logger.info(f"Validating update instance against schema: {update_dict}")
        try:
            schema(**update_dict)
        except ValueError as e:
            logger.error(f"Invalid update data: {update_dict}, error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid update data: {update_dict}, error: {str(e)}")

        logger.info(f"Checking if item already exist in the database")
        if item_id is not None and item_id >= 0:
            logger.info(f"Updating item with id {item_id}")
            db_item = db.query(model).filter(model.id == item_id).first()
            if not db_item:
                logger.error(f"Item with id {item_id} not found")
                raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")
            for key, value in update_dict.items():
                setattr(db_item, key, value)
        else:
            logger.info(f"Creating new item for added row")
            db_item = model(**update_dict)
            db.add(db_item)

    db.commit()
    logger.info(f"Committing changes to the database")
    return {"message": "Update successful"}

@app.post("/bulk-update")
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
