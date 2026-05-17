import { NotFoundError } from '../utils/errors';
import { calcDuration, minutesToHHMM, toUtcDateString } from '../utils/time';
import type { AmenityQueries, ReservationQueries, UserQueries } from '../db/queries';
import type { UserReservationItem, UserReservationsResponse } from '../schemas/user.schema';

export type UserServiceDeps = {
  amenityQ: AmenityQueries;
  reservationQ: ReservationQueries;
  userQ: UserQueries;
};

export async function getUserReservations(
  userId: number,
  deps: UserServiceDeps,
): Promise<UserReservationsResponse> {
  const user = await deps.userQ.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with id ${userId} not found`);
  }

  const rows = await deps.reservationQ.findByUserId(userId);
  if (rows.length === 0) return {};

  const uniqueAmenityIds = Array.from(new Set(rows.map((reservation) => reservation.amenityId)));
  const amenities = await deps.amenityQ.findManyByIds(uniqueAmenityIds);
  const amenityById = new Map(amenities.map((amenity) => [amenity.id, amenity.name]));

  const grouped: UserReservationsResponse = {};
  for (const reservation of rows) {
    const key = toUtcDateString(reservation.date);
    const item: UserReservationItem = {
      id: reservation.id,
      amenityId: reservation.amenityId,
      amenityName: amenityById.get(reservation.amenityId)!,
      startTime: minutesToHHMM(reservation.startTime),
      duration: calcDuration(reservation.startTime, reservation.endTime),
    };
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
}
