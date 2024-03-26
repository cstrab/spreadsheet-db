from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import Read, Update
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING
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

@app.post("/read")
def read_table(request: Read, db: Session = Depends(get_db)):
    logger.info("Starting /read endpoint")
    table_name = request.table_name
    skip = request.skip
    limit = request.limit
    
    if table_name not in TABLE_MODEL_MAPPING:
        logger.error(f"Table not found: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")
    
    model = TABLE_MODEL_MAPPING[table_name]
    schema = TABLE_SCHEMA_MAPPING[table_name]["read"]
    
    items = db.query(model).offset(skip).limit(limit).all()
    logger.info(f"Retrieved {len(items)} items from the database")
    
    # TODO: Investigate why return [schema.from_orm(item) for item in items] is not working as intended
    if table_name == 'table_one':
        result = [schema(id=item.id, name=item.name, description=item.description) for item in items]
    elif table_name == 'table_two':
        result = [schema(id=item.id, title=item.title, details=item.details, category=item.category) for item in items]
    else:
        logger.error(f"Unsupported table: {table_name}")
        raise HTTPException(status_code=404, detail=f"Unsupported table: {table_name}")

    logger.info("Ending /read endpoint")
    return result

@app.post("/update")
async def update_table(request: Update, db: Session = Depends(get_db)):
    logger.info("Starting /update endpoint")
    table_name = request.table_name
    updates = request.updates
    
    if table_name not in TABLE_MODEL_MAPPING or table_name not in TABLE_SCHEMA_MAPPING:
        logger.error(f"Table not found: {table_name}")
        raise HTTPException(status_code=404, detail="Table not found")
    
    model = TABLE_MODEL_MAPPING[table_name]
    
    for update_instance in updates.data:
        update_dict = update_instance.dict(exclude_unset=True)
        item_id = update_dict.pop("id", None)
        if item_id is None:
            # If the item_id is None, create a new row
            db_item = model(**update_dict)
            db.add(db_item)
        else:
            # If the item_id is not None, update the existing row
            db_item = db.query(model).filter(model.id == item_id).first()
            if not db_item:
                logger.error(f"Item with id {item_id} not found")
                raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")
            for key, value in update_dict.items():
                if hasattr(db_item, key):
                    setattr(db_item, key, value)
                else:
                    logger.error(f"Item with id {item_id} does not have attribute {key}")
                    raise HTTPException(status_code=404, detail=f"Item with id {item_id} does not have attribute {key}")
            db.add(db_item)
    db.commit()
    logger.info("Ending /update endpoint")
    return {"message": "Table updated successfully"}

