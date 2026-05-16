import { NotFoundError } from '../utils/errors';
import { calcDuration, minutesToHHMM } from '../utils/time';
import type { AmenityQueries, ReservationQueries } from '../db/queries';

export type AmenityServiceDeps = {
  amenityQ: AmenityQueries;
  reservationQ: ReservationQueries;
};

export type FormattedReservation = {
  id: number;
  userId: number;
  startTime: string;
  duration: number;
  amenityName: string;
};

export async function getAmenityReservations(
  amenityId: number,
  date: number,
  deps: AmenityServiceDeps,
): Promise<FormattedReservation[]> {
  const amenity = await deps.amenityQ.findById(amenityId);
  if (!amenity) {
    throw new NotFoundError(`Amenity with id ${amenityId} not found`);
  }
  const rows = await deps.reservationQ.findByAmenityAndDate(amenityId, date);
  return rows
    .slice()
    .sort((a, b) => a.startTime - b.startTime)
    .map((reservation) => ({
      id: reservation.id,
      userId: reservation.userId,
      startTime: minutesToHHMM(reservation.startTime),
      duration: calcDuration(reservation.startTime, reservation.endTime),
      amenityName: amenity.name,
    }));
}
