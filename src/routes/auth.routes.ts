import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { credentialsSchema } from '../schemas/auth.schema';
import { makeAuthController } from '../controllers/auth.controller';
import type { AuthServiceDeps } from '../services/auth.service';

export function makeAuthRouter(deps: AuthServiceDeps): Router {
  const router = Router();
  const controller = makeAuthController(deps);

  router.post('/register', validate(credentialsSchema, 'body'), controller.register);
  router.post('/login', validate(credentialsSchema, 'body'), controller.login);

  return router;
}
