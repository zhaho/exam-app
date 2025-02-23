import time
import logging
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

# Logging Details
LOG_FORMAT = "%(name)-12s %(asctime)s %(levelname)-8s %(filename)s:%(funcName)s %(message)s"
logger = logging.getLogger()
logger.setLevel(logging.INFO)
consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(logging.Formatter(LOG_FORMAT))
logger.addHandler(consoleHandler)
logger.info('Script is running')


while True:
    logger.info("Scraping Scraping!")
    logger.warning("Waiting for better days...")
    time.sleep(30)  
