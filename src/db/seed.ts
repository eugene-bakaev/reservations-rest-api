import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseCsv } from '../services/csv.service';
import type { AmenityQueries, ReservationQueries } from './queries';
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

export type SeedDeps = {
  amenityQ: AmenityQueries;
  reservationQ: ReservationQueries;
  amenitiesCsv: string;
  reservationsCsv: string;
};

export async function seedIfEmpty(deps: SeedDeps): Promise<void> {
  const count = await deps.amenityQ.countAll();
  if (count > 0) return;

  const amenityRows = parseCsv<RawAmenityRow>(deps.amenitiesCsv).map<Amenity>((r) => ({
    id: Number(r.id),
    name: r.name,
  }));
  const reservationRows = parseCsv<RawReservationRow>(deps.reservationsCsv).map<Reservation>((r) => ({
    id: Number(r.id),
    amenityId: Number(r.amenity_id),
    userId: Number(r.user_id),
    startTime: Number(r.start_time),
    endTime: Number(r.end_time),
    date: Number(r.date),
  }));

  await deps.amenityQ.insertMany(amenityRows);
  await deps.reservationQ.insertMany(reservationRows);
}

export function loadSeedFiles(rootDir = process.cwd()): { amenitiesCsv: string; reservationsCsv: string } {
  return {
    amenitiesCsv: readFileSync(resolve(rootDir, 'data/amenities.csv'), 'utf8'),
    reservationsCsv: readFileSync(resolve(rootDir, 'data/reservations.csv'), 'utf8'),
  };
}
