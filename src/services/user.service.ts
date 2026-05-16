import { calcDuration, minutesToHHMM, toUtcDateString } from '../utils/time';
import type { AmenityQueries, ReservationQueries } from '../db/queries';

export type UserServiceDeps = {
  amenityQ: AmenityQueries;
  reservationQ: ReservationQueries;
};

export type UserReservationItem = {
  id: number;
  amenityId: number;
  amenityName: string;
  startTime: string;
  duration: number;
};

export type UserReservationsResponse = Record<string, UserReservationItem[]>;

export async function getUserReservations(
  userId: number,
  deps: UserServiceDeps,
): Promise<UserReservationsResponse> {
  const rows = await deps.reservationQ.findByUserId(userId);
  if (rows.length === 0) return {};

  const uniqueAmenityIds = Array.from(new Set(rows.map((reservation) => reservation.amenityId)));
  const amenityById = new Map<number, string>();
  for (const id of uniqueAmenityIds) {
    const amenity = await deps.amenityQ.findById(id);
    if (amenity) amenityById.set(id, amenity.name);
  }

  const grouped: UserReservationsResponse = {};
  for (const reservation of rows) {
    const key = toUtcDateString(reservation.date);
    const item: UserReservationItem = {
      id: reservation.id,
      amenityId: reservation.amenityId,
      amenityName: amenityById.get(reservation.amenityId) ?? '',
      startTime: minutesToHHMM(reservation.startTime),
      duration: calcDuration(reservation.startTime, reservation.endTime),
    };
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
}
