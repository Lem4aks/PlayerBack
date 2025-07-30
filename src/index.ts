import logger from 'jet-logger';
import { connectDatabase } from './database/connection';
import ENV from '@src/common/constants/ENV';
import server from './server';


/******************************************************************************
 Constants
 ******************************************************************************/

const SERVER_START_MSG = (
  'Express server started on port: ' + ENV.Port.toString()
);
const DB_CONNECT_FAILED_MSG = 'Failed to connect to the database';


/******************************************************************************
 Run
 ******************************************************************************/

connectDatabase()
  .then(() => {
    server.listen(ENV.Port, (err) => {
      if (!!err) {
        logger.err(err.message);
      } else {
        logger.info(SERVER_START_MSG);
      }
    });
  })
  .catch(err => {
    logger.err(DB_CONNECT_FAILED_MSG);
    logger.err(err);
  });