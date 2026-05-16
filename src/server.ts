import 'dotenv/config';
import { createApp } from './app';
import { loadEnv } from './config/env';
import { getDb, closeDb } from './config/db';
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
  const server = app.listen(env.PORT, () => {
    console.info(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string): void => {
    console.info(`[server] received ${signal}, shutting down gracefully...`);
    server.close(async (closeErr) => {
      if (closeErr) console.error('[server] error closing HTTP server:', closeErr);
      try {
        await closeDb();
      } catch (dbErr) {
        console.error('[server] error closing DB pool:', dbErr);
      }
      process.exit(closeErr ? 1 : 0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
