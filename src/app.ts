import 'express-async-errors';
import express, { Application } from 'express';
import { errorHandler } from './middleware/error.middleware';

export function createApp(): Application {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(errorHandler);
  return app;
}
