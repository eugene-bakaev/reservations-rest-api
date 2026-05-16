import { getAmenityReservations } from '@/services/amenity.service';
import { NotFoundError } from '@/utils/errors';
import type { AmenityQueries, ReservationQueries } from '@/db/queries';
import type { Amenity, Reservation } from '@/db/schema';

function makeDeps(opts: {
  amenity?: Amenity;
  reservations?: Reservation[];
}) {
  const amenityQ: AmenityQueries = {
    findById: jest.fn(async () => opts.amenity),
    countAll: jest.fn(),
    insertMany: jest.fn(),
  };
  const reservationQ: ReservationQueries = {
    findByAmenityAndDate: jest.fn(async () => opts.reservations ?? []),
    findByUserId: jest.fn(),
    insertMany: jest.fn(),
  };
  return { amenityQ, reservationQ };
}

describe('getAmenityReservations', () => {
  it('throws NotFoundError when amenity does not exist', async () => {
    const deps = makeDeps({ amenity: undefined });
    await expect(getAmenityReservations(1, 1593648000000, deps)).rejects.toThrow(NotFoundError);
  });

  it('returns an empty array when amenity exists but no reservations match', async () => {
    const deps = makeDeps({ amenity: { id: 1, name: 'Gym' }, reservations: [] });
    expect(await getAmenityReservations(1, 1593648000000, deps)).toEqual([]);
  });

  it('formats reservations and sorts by start time ascending', async () => {
    const deps = makeDeps({
      amenity: { id: 1, name: 'Gym' },
      reservations: [
        { id: 2, amenityId: 1, userId: 5, startTime: 600, endTime: 900, date: 1593648000000 },
        { id: 1, amenityId: 1, userId: 3, startTime: 300, endTime: 480, date: 1593648000000 },
      ],
    });
    expect(await getAmenityReservations(1, 1593648000000, deps)).toEqual([
      { id: 1, userId: 3, startTime: '05:00', duration: 180, amenityName: 'Gym' },
      { id: 2, userId: 5, startTime: '10:00', duration: 300, amenityName: 'Gym' },
    ]);
  });
});
