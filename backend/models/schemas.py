from typing import List, Optional

from pydantic import BaseModel


class ItemBase(BaseModel):
    name: str
    description: str

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    id: int
    name: Optional[str] = None
    description: Optional[str] = None

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

class ItemListUpdate(BaseModel):
    data: List[ItemUpdate]
