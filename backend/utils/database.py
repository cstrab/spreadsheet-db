from models.models import SessionLocal
from utils.logger import setup_logger

logger = setup_logger('backend')

def get_db():
    db = SessionLocal()
    logger.info("Database session created")
    try:
        yield db
    finally:
        db.close()
        logger.info("Database session closed")
