import { readFileSync } from 'fs';
import { resolve } from 'path';
import bcrypt from 'bcrypt';
import { parseCsv } from '../services/csv.service';
import type { AmenityQueries, ReservationQueries, UserQueries } from './queries';
import type { Amenity, Reservation } from './schema';

type RawAmenityRow = { id: string; name: string };
type RawReservationRow = {
  id: string;
  amenity_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  date: string;
};

const BCRYPT_COST = 10;
const LEGACY_PASSWORD = 'Pass123$';

export type SeedDeps = {
  amenityQ: AmenityQueries;
  reservationQ: ReservationQueries;
  amenitiesCsv: string;
  reservationsCsv: string;
};

export async function seedIfEmpty(deps: SeedDeps): Promise<void> {
  const count = await deps.amenityQ.countAll();
  if (count > 0) return;

  const amenityRows = parseCsv<RawAmenityRow>(deps.amenitiesCsv).map<Amenity>((row) => ({
    id: Number(row.id),
    name: row.name,
  }));
  const reservationRows = parseCsv<RawReservationRow>(deps.reservationsCsv).map<Reservation>((row) => ({
    id: Number(row.id),
    amenityId: Number(row.amenity_id),
    userId: Number(row.user_id),
    startTime: Number(row.start_time),
    endTime: Number(row.end_time),
    date: Number(row.date),
  }));

  await deps.amenityQ.insertMany(amenityRows);
  await deps.reservationQ.insertMany(reservationRows);
}

export type LegacyUsersDeps = {
  userQ: UserQueries;
  reservationQ: ReservationQueries;
};

export async function seedLegacyUsersIfEmpty(deps: LegacyUsersDeps): Promise<void> {
  const count = await deps.userQ.countAll();
  if (count > 0) return;

  const userIds = await deps.reservationQ.distinctUserIds();
  if (userIds.length === 0) return;

  const legacyUsers = await Promise.all(
    userIds.map(async (id) => ({
      id,
      username: `legacy_user_${id}`,
      passwordHash: await bcrypt.hash(LEGACY_PASSWORD, BCRYPT_COST),
    })),
  );

  await deps.userQ.insertManyWithIds(legacyUsers);
}

export function loadSeedFiles(rootDir = process.cwd()): { amenitiesCsv: string; reservationsCsv: string } {
  return {
    amenitiesCsv: readFileSync(resolve(rootDir, 'data/amenities.csv'), 'utf8'),
    reservationsCsv: readFileSync(resolve(rootDir, 'data/reservations.csv'), 'utf8'),
  };
}
