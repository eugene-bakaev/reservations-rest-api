import { seedIfEmpty } from '@/db/seed';
import type { AmenityQueries, ReservationQueries } from '@/db/queries';

function makeFakeQueries(initialCount = 0) {
  let amenityCount = initialCount;
  const insertedAmenities: any[] = [];
  const insertedReservations: any[] = [];

  const amenityQ: AmenityQueries = {
    findById: jest.fn(),
    countAll: jest.fn(async () => amenityCount),
    insertMany: jest.fn(async (rows) => { insertedAmenities.push(...rows); amenityCount += rows.length; }),
  };
  const reservationQ: ReservationQueries = {
    findByAmenityAndDate: jest.fn(),
    findByUserId: jest.fn(),
    insertMany: jest.fn(async (rows) => { insertedReservations.push(...rows); }),
  };

  return { amenityQ, reservationQ, insertedAmenities, insertedReservations };
}

describe('seedIfEmpty', () => {
  it('inserts amenities and reservations when amenities table is empty', async () => {
    const { amenityQ, reservationQ, insertedAmenities, insertedReservations } = makeFakeQueries(0);
    await seedIfEmpty({
      amenityQ,
      reservationQ,
      amenitiesCsv: 'id;name\n1;Gym\n2;Pool',
      reservationsCsv: 'id;amenity_id;user_id;start_time;end_time;date\n1;1;5;300;480;1593648000000',
    });
    expect(insertedAmenities).toEqual([
      { id: 1, name: 'Gym' },
      { id: 2, name: 'Pool' },
    ]);
    expect(insertedReservations).toEqual([
      { id: 1, amenityId: 1, userId: 5, startTime: 300, endTime: 480, date: 1593648000000 },
    ]);
  });

  it('skips when amenities table is non-empty', async () => {
    const { amenityQ, reservationQ, insertedAmenities, insertedReservations } = makeFakeQueries(10);
    await seedIfEmpty({
      amenityQ,
      reservationQ,
      amenitiesCsv: 'id;name\n1;Gym',
      reservationsCsv: 'id;amenity_id;user_id;start_time;end_time;date\n1;1;5;300;480;1593648000000',
    });
    expect(amenityQ.insertMany).not.toHaveBeenCalled();
    expect(reservationQ.insertMany).not.toHaveBeenCalled();
    expect(insertedAmenities).toEqual([]);
    expect(insertedReservations).toEqual([]);
  });
});
