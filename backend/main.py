from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import Read, Update, TableOneRead, TableTwoRead
from models.mappings import TABLE_MODEL_MAPPING, TABLE_SCHEMA_MAPPING
from utils.database import get_db


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Investigate why this is not working as intended
# @app.post("/read")
# def read_table(request: Read, db: Session = Depends(get_db)):
#     table_name = request.table_name
#     skip = request.skip
#     limit = request.limit
    
#     if table_name not in TABLE_MODEL_MAPPING:
#         raise HTTPException(status_code=404, detail="Table not found")
    
#     model = TABLE_MODEL_MAPPING[table_name]
#     schema = TABLE_SCHEMA_MAPPING[table_name]["read"]
    
#     items = db.query(model).offset(skip).limit(limit).all()
#     return [schema.from_orm(item) for item in items]

@app.post("/read")
def read_table(request: Read, db: Session = Depends(get_db)):
    table_name = request.table_name
    skip = request.skip
    limit = request.limit
    
    if table_name not in TABLE_MODEL_MAPPING:
        raise HTTPException(status_code=404, detail="Table not found")
    
    model = TABLE_MODEL_MAPPING[table_name]
    schema = TABLE_SCHEMA_MAPPING[table_name]["read"]
    
    items = db.query(model).offset(skip).limit(limit).all()
    
    if table_name == 'table_one':
        result = [schema(id=item.id, name=item.name, description=item.description) for item in items]
    elif table_name == 'table_two':
        result = [schema(id=item.id, title=item.title, details=item.details, category=item.category) for item in items]
    else:
        raise HTTPException(status_code=404, detail=f"Unsupported table: {table_name}")

    return result

@app.post("/update")
async def update_table(request: Update, db: Session = Depends(get_db)):
    table_name = request.table_name
    updates = request.updates
    
    if table_name not in TABLE_MODEL_MAPPING or table_name not in TABLE_SCHEMA_MAPPING:
        raise HTTPException(status_code=404, detail="Table not found")
    
    model = TABLE_MODEL_MAPPING[table_name]
    schema = TABLE_SCHEMA_MAPPING[table_name]["update"]
    
    for update_instance in updates.data:
        update_dict = update_instance.dict(exclude_unset=True)
        item_id = update_dict.pop("id")
        db_item = db.query(model).filter(model.id == item_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")
        for key, value in update_dict.items():
            setattr(db_item, key, value)
        db.add(db_item)
    db.commit()
    return {"message": "Table updated successfully"}

