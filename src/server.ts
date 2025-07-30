import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import ENV from '@src/common/constants/ENV';
import cors from 'cors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { NodeEnvs } from '@src/common/constants';
import { userRoutes } from '@src/routes/UserRoutes';
import { postRoutes } from '@src/routes/PostRoutes';
import { commentRoutes } from '@src/routes/CommentRoutes';


/******************************************************************************
                                Setup
******************************************************************************/

const app = express();
app.use(cors());


// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  // eslint-disable-next-line n/no-process-env
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

// **** Routes **** //
// Mount API route modules
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Add APIs, must be after middleware

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});



// Default route
app.get('/', (_: Request, res: Response) => {
  return res.json({ message: 'Welcome to the PlayerBack API' });
});

// 404 handler for unmatched routes
app.use('/{*any}', (_: Request, res: Response) => {
  return res.status(HttpStatusCodes.NOT_FOUND).json({ error: 'Not Found' });
});


/******************************************************************************
                                Export default
******************************************************************************/

export default app;
