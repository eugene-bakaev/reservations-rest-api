import { z } from 'zod';

export const amenityReservationsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const amenityReservationsQuerySchema = z.object({
  date: z.coerce.number().int().nonnegative(),
});

export const formattedReservationSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  startTime: z.string(),
  duration: z.number().int(),
  amenityName: z.string(),
});

export type FormattedReservation = z.infer<typeof formattedReservationSchema>;
