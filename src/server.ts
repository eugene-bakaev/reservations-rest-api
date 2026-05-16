import 'dotenv/config';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { getDb } from './config/db';
import { makeAmenityQueries, makeReservationQueries } from './db/queries';
import { seedIfEmpty, loadSeedFiles } from './db/seed';

async function main(): Promise<void> {
  const env = loadEnv();
  const db = getDb(env.DATABASE_URL);
  const amenityQ = makeAmenityQueries(db);
  const reservationQ = makeReservationQueries(db);

  await seedIfEmpty({ amenityQ, reservationQ, ...loadSeedFiles() });

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`); // eslint-disable-line no-console
  });
}

main().catch((err) => {
  console.error(err); // eslint-disable-line no-console
  process.exit(1);
});
