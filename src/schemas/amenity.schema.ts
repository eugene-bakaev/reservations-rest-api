import { z } from 'zod';

export const amenityReservationsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const amenityReservationsQuerySchema = z.object({
  date: z.coerce.number().int().nonnegative(),
});
