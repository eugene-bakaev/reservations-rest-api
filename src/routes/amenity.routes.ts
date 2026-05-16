import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { amenityReservationsParamsSchema, amenityReservationsQuerySchema } from '../schemas/amenity.schema';
import { makeAmenityController } from '../controllers/amenity.controller';
import type { AmenityServiceDeps } from '../services/amenity.service';

export function makeAmenityRouter(deps: AmenityServiceDeps): Router {
  const router = Router();
  const controller = makeAmenityController(deps);

  router.get(
    '/:id/reservations',
    validate(amenityReservationsParamsSchema, 'params'),
    validate(amenityReservationsQuerySchema, 'query'),
    controller.getReservations,
  );

  return router;
}
