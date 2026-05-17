import 'express-async-errors';
import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.middleware';
import { makeAmenityRouter } from './routes/amenity.routes';
import { makeUserRouter } from './routes/user.routes';
import { makeCsvRouter } from './routes/csv.routes';
import { makeAuthRouter } from './routes/auth.routes';
import { buildOpenApiSpec } from './config/swagger';
import { NotFoundError } from './utils/errors';
import type { AmenityServiceDeps } from './services/amenity.service';
import type { UserServiceDeps } from './services/user.service';
import type { AuthServiceDeps } from './services/auth.service';

export type AppDeps = AmenityServiceDeps & UserServiceDeps & AuthServiceDeps;

export function createApp(deps: AppDeps): Application {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/amenities', makeAmenityRouter(deps));
  app.use('/users', makeUserRouter(deps));
  app.use('/csv', makeCsvRouter(deps));
  app.use('/auth', makeAuthRouter(deps));

  const openApiSpec = buildOpenApiSpec();
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    swaggerOptions: { persistAuthorization: true },
  }));

  app.use((req, _res, next) => next(new NotFoundError(`Route not found: ${req.method} ${req.path}`)));
  app.use(errorHandler);
  return app;
}
