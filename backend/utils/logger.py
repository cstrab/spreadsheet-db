import logging
from logging.handlers import RotatingFileHandler
import sys
import os

LOG_DIR_PATH = '/tmp/'
DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
MODE = 'a'
MAX_BYTES = 10 * 1024 * 1024
BACKUP_COUNT = 5

def setup_logger(name, level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    if not logger.handlers:
        log_file_path = os.path.join(LOG_DIR_PATH, f"{name}.log") 
        file_handler = RotatingFileHandler(log_file_path, mode=MODE, maxBytes=MAX_BYTES, backupCount=BACKUP_COUNT)
        file_handler.setLevel(level)

        formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
        file_handler.setFormatter(formatter)

        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger
