import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { resolve } from 'path';
import { loadEnv } from '../config/env';
import { getDb, closeDb } from '../config/db';
import { makeAmenityQueries, makeReservationQueries } from './queries';
import { seedIfEmpty, loadSeedFiles } from './seed';

async function main(): Promise<void> {
  const env = loadEnv();
  const db = getDb(env.DATABASE_URL);

  console.info('[migrate-cli] running schema migrations...');
  await migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle/migrations') });

  console.info('[migrate-cli] seeding amenities and reservations if empty...');
  const amenityQ = makeAmenityQueries(db);
  const reservationQ = makeReservationQueries(db);
  const { amenitiesCsv, reservationsCsv } = loadSeedFiles();
  await seedIfEmpty({ amenityQ, reservationQ, amenitiesCsv, reservationsCsv });

  await closeDb();
}

main().catch((err) => {
  console.error('[migrate-cli] failed:', err);
  process.exit(1);
});
