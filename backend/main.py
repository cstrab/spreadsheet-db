import os
from typing import List

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from models.models import Item as DBItem
from models.schemas import ItemListUpdate, Item
from utils.database import get_db


GET_ITEMS_ENDPOINT = os.getenv('GET_ITEMS_ENDPOINT')  
UPDATE_ITEMS_ENDPOINT = os.getenv('UPDATE_ITEMS_ENDPOINT')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.get(GET_ITEMS_ENDPOINT, response_model=List[Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(DBItem).offset(skip).limit(limit).all()
    return items

@app.put(UPDATE_ITEMS_ENDPOINT, response_model=List[Item])
async def update_items(item_list: ItemListUpdate, db: Session = Depends(get_db)):
    current_ids = db.query(DBItem.id).all()
    current_ids = set([id[0] for id in current_ids])

    payload_ids = set([item.id for item in item_list.data])

    delete_ids = current_ids - payload_ids

    if delete_ids:
        db.query(DBItem).filter(DBItem.id.in_(delete_ids)).delete(synchronize_session='fetch')
        db.commit()

    updated_items = []
    for item_update in item_list.data:
        db_item = db.query(DBItem).filter(DBItem.id == item_update.id).first()
        if db_item:
            if item_update.name is not None:
                db_item.name = item_update.name
            if item_update.description is not None:
                db_item.description = item_update.description
        else:
            db_item = DBItem(id=item_update.id, name=item_update.name, description=item_update.description)
            db.add(db_item)
        db.commit()
        db.refresh(db_item)
        updated_items.append(db_item)

    return updated_items
