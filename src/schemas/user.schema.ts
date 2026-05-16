import { z } from 'zod';

export const userReservationsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const userReservationItemSchema = z.object({
  id: z.number().int(),
  amenityId: z.number().int(),
  amenityName: z.string(),
  startTime: z.string(),
  duration: z.number().int(),
});

export const userReservationsResponseSchema = z.record(z.string(), z.array(userReservationItemSchema));

export type UserReservationItem = z.infer<typeof userReservationItemSchema>;
export type UserReservationsResponse = z.infer<typeof userReservationsResponseSchema>;
