import { getUserReservations } from '@/services/user.service';
import { NotFoundError } from '@/utils/errors';
import type { AmenityQueries, ReservationQueries, UserQueries } from '@/db/queries';
import type { Amenity, Reservation, User } from '@/db/schema';

function makeDeps(opts: {
  amenitiesById: Record<number, Amenity>;
  reservations: Reservation[];
  userExists?: boolean;
}) {
  const userExists = opts.userExists !== false;
  const amenityQ: AmenityQueries = {
    findById: jest.fn(),
    findManyByIds: jest.fn(async (ids: number[]) =>
      ids.map((id) => opts.amenitiesById[id]).filter((amenity): amenity is Amenity => Boolean(amenity)),
    ),
    countAll: jest.fn(),
    insertMany: jest.fn(),
  };
  const reservationQ: ReservationQueries = {
    findByAmenityAndDate: jest.fn(),
    findByUserId: jest.fn(async () => opts.reservations),
    insertMany: jest.fn(),
    distinctUserIds: jest.fn(),
  };
  const userQ: UserQueries = {
    findById: jest.fn(async (id: number): Promise<User | undefined> =>
      userExists ? { id, username: `user_${id}`, passwordHash: 'h', createdAt: new Date() } : undefined,
    ),
    findByUsername: jest.fn(),
    insert: jest.fn(),
    countAll: jest.fn(),
    insertManyWithIds: jest.fn(),
  };
  return { amenityQ, reservationQ, userQ };
}

describe('getUserReservations', () => {
  it('throws NotFoundError when the user does not exist', async () => {
    const deps = makeDeps({ amenitiesById: {}, reservations: [], userExists: false });
    await expect(getUserReservations(42, deps)).rejects.toThrow(NotFoundError);
  });

  it('returns an empty object when user exists but has no reservations', async () => {
    const deps = makeDeps({ amenitiesById: {}, reservations: [] });
    expect(await getUserReservations(42, deps)).toEqual({});
  });

  it('groups reservations by UTC date string, formats start time, includes amenity name', async () => {
    const deps = makeDeps({
      amenitiesById: { 1: { id: 1, name: 'Gym' }, 2: { id: 2, name: 'Pool' } },
      reservations: [
        { id: 1, amenityId: 1, userId: 42, startTime: 600, endTime: 900, date: 1593561600000 },
        { id: 2, amenityId: 2, userId: 42, startTime: 300, endTime: 480, date: 1593561600000 },
        { id: 3, amenityId: 1, userId: 42, startTime: 720, endTime: 1080, date: 1593820800000 },
      ],
    });
    expect(await getUserReservations(42, deps)).toEqual({
      '2020-07-01': [
        { id: 1, amenityId: 1, amenityName: 'Gym', startTime: '10:00', duration: 300 },
        { id: 2, amenityId: 2, amenityName: 'Pool', startTime: '05:00', duration: 180 },
      ],
      '2020-07-04': [
        { id: 3, amenityId: 1, amenityName: 'Gym', startTime: '12:00', duration: 360 },
      ],
    });
  });
});
