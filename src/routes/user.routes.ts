import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { userReservationsParamsSchema } from '../schemas/user.schema';
import { makeUserController } from '../controllers/user.controller';
import type { UserServiceDeps } from '../services/user.service';

export function makeUserRouter(deps: UserServiceDeps): Router {
  const router = Router();
  const controller = makeUserController(deps);

  router.get(
    '/:id/reservations',
    validate(userReservationsParamsSchema, 'params'),
    controller.getReservations,
  );

  return router;
}
