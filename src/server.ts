import 'dotenv/config';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { getDb } from './config/db';
import { makeAmenityQueries, makeReservationQueries, makeUserQueries } from './db/queries';
import { seedIfEmpty, seedLegacyUsersIfEmpty, loadSeedFiles } from './db/seed';
import { makeJwtSigner } from './services/token.service';

async function main(): Promise<void> {
  const env = loadEnv();
  const db = getDb(env.DATABASE_URL);
  const amenityQ = makeAmenityQueries(db);
  const reservationQ = makeReservationQueries(db);
  const userQ = makeUserQueries(db);

  await seedIfEmpty({ amenityQ, reservationQ, ...loadSeedFiles() });
  await seedLegacyUsersIfEmpty({ userQ, reservationQ });

  const signer = makeJwtSigner(env.JWT_SECRET);
  const app = createApp({ amenityQ, reservationQ, userQ, signer });
  app.listen(env.PORT, () => {
    console.info(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
