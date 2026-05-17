import bcrypt from 'bcrypt';
import { seedIfEmpty, seedLegacyUsersIfEmpty } from '@/db/seed';
import type { AmenityQueries, ReservationQueries, UserQueries } from '@/db/queries';

function makeFakeQueries(initialCount = 0) {
  let amenityCount = initialCount;
  const insertedAmenities: any[] = [];
  const insertedReservations: any[] = [];

  const amenityQ: AmenityQueries = {
    findById: jest.fn(),
    findManyByIds: jest.fn(),
    countAll: jest.fn(async () => amenityCount),
    insertMany: jest.fn(async (rows) => { insertedAmenities.push(...rows); amenityCount += rows.length; }),
  };
  const reservationQ: ReservationQueries = {
    findByAmenityAndDate: jest.fn(),
    findByUserId: jest.fn(),
    insertMany: jest.fn(async (rows) => { insertedReservations.push(...rows); }),
    distinctUserIds: jest.fn(),
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

function makeLegacyDeps(opts: { userCount: number; distinctUserIds: number[] }) {
  const insertedLegacy: Array<{ id: number; username: string; passwordHash: string }> = [];
  const userQ: UserQueries = {
    findById: jest.fn(),
    findByUsername: jest.fn(),
    insert: jest.fn(),
    countAll: jest.fn(async () => opts.userCount),
    insertManyWithIds: jest.fn(async (rows) => { insertedLegacy.push(...rows); }),
  };
  const reservationQ: ReservationQueries = {
    findByAmenityAndDate: jest.fn(),
    findByUserId: jest.fn(),
    insertMany: jest.fn(),
    distinctUserIds: jest.fn(async () => opts.distinctUserIds),
  };
  return { userQ, reservationQ, insertedLegacy };
}

describe('seedLegacyUsersIfEmpty', () => {
  it('inserts one placeholder per distinct reservation user_id when users table is empty', async () => {
    const { userQ, reservationQ, insertedLegacy } = makeLegacyDeps({
      userCount: 0,
      distinctUserIds: [1, 5, 42],
    });
    await seedLegacyUsersIfEmpty({ userQ, reservationQ });
    expect(insertedLegacy.map((row) => ({ id: row.id, username: row.username }))).toEqual([
      { id: 1, username: 'legacy_user_1' },
      { id: 5, username: 'legacy_user_5' },
      { id: 42, username: 'legacy_user_42' },
    ]);
    insertedLegacy.forEach((row) => {
      expect(row.passwordHash.length).toBeGreaterThan(20);
    });
  });

  it('produces a unique bcrypt hash per legacy user (different salts)', async () => {
    const { userQ, reservationQ, insertedLegacy } = makeLegacyDeps({
      userCount: 0,
      distinctUserIds: [1, 2, 3, 4],
    });
    await seedLegacyUsersIfEmpty({ userQ, reservationQ });
    const hashes = insertedLegacy.map((row) => row.passwordHash);
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  it('every legacy user can be verified with the shared password Pass123$', async () => {
    const { userQ, reservationQ, insertedLegacy } = makeLegacyDeps({
      userCount: 0,
      distinctUserIds: [1, 7, 99],
    });
    await seedLegacyUsersIfEmpty({ userQ, reservationQ });
    for (const row of insertedLegacy) {
      expect(await bcrypt.compare('Pass123$', row.passwordHash)).toBe(true);
    }
  });

  it('skips when users table is non-empty', async () => {
    const { userQ, reservationQ, insertedLegacy } = makeLegacyDeps({
      userCount: 7,
      distinctUserIds: [1, 5, 42],
    });
    await seedLegacyUsersIfEmpty({ userQ, reservationQ });
    expect(userQ.insertManyWithIds).not.toHaveBeenCalled();
    expect(reservationQ.distinctUserIds).not.toHaveBeenCalled();
    expect(insertedLegacy).toEqual([]);
  });

  it('does not insert when reservations have no user_ids', async () => {
    const { userQ, reservationQ, insertedLegacy } = makeLegacyDeps({
      userCount: 0,
      distinctUserIds: [],
    });
    await seedLegacyUsersIfEmpty({ userQ, reservationQ });
    expect(userQ.insertManyWithIds).not.toHaveBeenCalled();
    expect(insertedLegacy).toEqual([]);
  });
});
