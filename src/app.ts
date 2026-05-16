import 'express-async-errors';
import express, { Application } from 'express';
import { errorHandler } from './middleware/error.middleware';
import { makeAmenityRouter } from './routes/amenity.routes';
import { makeUserRouter } from './routes/user.routes';
import type { AmenityServiceDeps } from './services/amenity.service';
import type { UserServiceDeps } from './services/user.service';

export type AppDeps = AmenityServiceDeps & UserServiceDeps;

export function createApp(deps: AppDeps): Application {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/amenities', makeAmenityRouter(deps));
  app.use('/users', makeUserRouter(deps));

  app.use(errorHandler);
  return app;
}
