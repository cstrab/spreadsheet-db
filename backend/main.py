from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from models.schemas import Read, Update, BulkUpdate
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING
from utils.database import get_db
from utils.logger import setup_logger

# TODO: Review with Larry, consider using DAO for database operations each table
# TODO: Add UpdateReponse and BulkUpdateResponse models

logger = setup_logger('backend')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Move this to models.py and also test with from_orm again to see if error still exists
def model_to_dict(instance, fields=None):
    """Convert an SQLAlchemy model instance into a dictionary."""
    if fields:
        return {c: getattr(instance, c, None) for c in fields}
    else:
        return {c.key: getattr(instance, c.key, None) for c in instance.__table__.columns}

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
    query = db.query(model).offset(skip).limit(limit)
    items = (schema(**item.__dict__) for item in query) 

    columns = [{"name": column.name, "type": str(column.type).lower()} for column in model.__table__.columns]
    result = list(items)  

    logger.info(f"Returning columns and data for table: {table_name}")
    return {"columns": columns, "data": result}

# @app.post("/update")
# async def update_table(request: Update, db: Session = Depends(get_db)):
#     table_name = request.table_name
#     updates = request.updates
#     removed_row_ids = request.removed_row_ids

#     logger.info(f"Executing /update endpoint for table: {table_name}")

#     logger.info(f"Checking if table {table_name} is in mappings and defining model and schema")
#     if table_name in TABLE_MODEL_MAPPING and table_name in TABLE_SCHEMA_MAPPING:
#         model = TABLE_MODEL_MAPPING[table_name]
#         schema = TABLE_SCHEMA_MAPPING[table_name]["update"]
#     else:
#         logger.error(f"Table not found in mappings: {table_name}")
#         raise HTTPException(status_code=404, detail="Table not found")

#     logger.info(f"Deleting rows from table: {table_name}")
#     for row_id in removed_row_ids:
#         db_item = db.query(model).filter(model.id == row_id).first()
#         if db_item:
#             db.delete(db_item)
#             logger.info(f"Deleted item with id {row_id} from table: {table_name}")
#         else:
#             logger.error(f"Item with id {row_id} not found")
#             raise HTTPException(status_code=404, detail=f"Item with id {row_id} not found")

#     logger.info(f"Handling updated and new rows for table: {table_name}")
#     for update_instance in updates.data:
#         update_dict = update_instance.dict(exclude_unset=True)
#         item_id = update_dict.pop("id", None)

#         logger.info(f"Validating update instance against schema: {update_dict}")
#         try:
#             schema(**update_dict)
#         except ValueError as e:
#             logger.error(f"Invalid update data: {update_dict}, error: {str(e)}")
#             raise HTTPException(status_code=400, detail=f"Invalid update data: {update_dict}, error: {str(e)}")

#         logger.info(f"Checking if item already exist in the database")
#         if item_id is not None and item_id >= 0:
#             logger.info(f"Updating item with id {item_id}")
#             db_item = db.query(model).filter(model.id == item_id).first()
#             if not db_item:
#                 logger.error(f"Item with id {item_id} not found")
#                 raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")
#             for key, value in update_dict.items():
#                 setattr(db_item, key, value)
#         else:
#             logger.info(f"Creating new item for added row")
#             db_item = model(**update_dict)
#             db.add(db_item)

#     db.commit()
#     logger.info(f"Committing changes to the database")
#     return {"message": "Update successful"}

@app.post("/update")
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

# @app.post("/bulk-update")
# async def bulk_update_table(request: BulkUpdate, db: Session = Depends(get_db)):
#     table_name = request.table_name
#     updates = request.updates.data

#     logger.info(f"Executing /bulk-update endpoint for table: {table_name}")

#     if table_name not in TABLE_MODEL_MAPPING:
#         logger.error(f"Table not found in mappings: {table_name}")
#         raise HTTPException(status_code=404, detail="Table not found")

#     model = TABLE_MODEL_MAPPING[table_name]

#     try:
#         logger.info(f"Clearing all entries from table: {table_name}")
#         db.query(model).delete()

#         # TODO: Method for resetting the ID 
#         # PostgreSQL-specific sequence reset
#         sequence_name = f"test_schema.{table_name}_id_seq"  # Adjust based on your naming conventions
#         db.execute(text(f"ALTER SEQUENCE {sequence_name} RESTART WITH 1"))
#         # MSSQL-specific identity reset
#         db.execute(text(f"DBCC CHECKIDENT ('{table_name}', RESEED, 0)"))

#         for update_instance in updates:
#             update_dict = update_instance.dict(exclude={'id'}) 
#             db_item = model(**update_dict)
#             db.add(db_item)

#         db.commit()
#         logger.info(f"Successfully updated table {table_name} with new data")
#     except Exception as e:
#         db.rollback()
#         logger.error(f"Failed to update table {table_name}: {e}")
#         raise HTTPException(status_code=500, detail="Failed to update data")

#     return {"message": "Bulk update successful"}

@app.post("/bulk-update")
async def bulk_update_table(request: BulkUpdate, db: Session = Depends(get_db)):
    table_name = request.table_name
    updates = request.updates.data

    logger.info(f"Executing /bulk-update endpoint for table: {table_name}")

    if table_name not in TABLE_MODEL_MAPPING:
        logger.error(f"Table not found in mappings: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")

    model = TABLE_MODEL_MAPPING[table_name]
    updated_ids = []

    try:
        logger.info(f"Clearing all entries from table: {table_name}")
        db.query(model).delete()


        for update_instance in updates:
            update_dict = update_instance.dict(exclude_unset=True)  # Make sure to exclude unset fields
            temp_id = update_dict.pop('id', None)  # Retrieve and remove tempId from the dict
            db_item = model(**update_dict)
            db.add(db_item)
            db.flush()  # This ensures the db_item has an ID assigned
            
            updated_ids.append({"tempId": temp_id, "dbId": db_item.id})

        db.commit()
        logger.info(f"Successfully updated table {table_name} with new data")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update table {table_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update data")

    return {"message": "Bulk update successful", "updated_ids": updated_ids}

