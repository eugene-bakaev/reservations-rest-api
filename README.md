# reservations-rest-api

REST API for amenity reservations.

## Stack

TypeScript, Express, Drizzle ORM (MySQL), Zod, JWT, Swagger UI, Docker, Jest

## Quick start (Docker)

```sh
cp .env.example .env
docker compose up --build
```

On first boot the api container runs Drizzle migrations, seeds `amenities` and `reservations` from `data/*.csv`, seeds one `legacy_user_<id>` per distinct `reservations.user_id` (96 rows) with bcrypt-hashed password `Pass123$`, then starts the server.

Once it's up:

- Health: <http://localhost:3000/health>
- Swagger UI: <http://localhost:3000/api-docs>
- OpenAPI JSON: <http://localhost:3000/openapi.json>

## Local development

```sh
pnpm install
cp .env.example .env             # set DATABASE_URL, JWT_SECRET
docker compose up -d mysql       # MySQL only
pnpm db:migrate                  # apply schema
pnpm dev                         # start API in watch mode
pnpm test                        # 61 unit tests across 12 suites
pnpm build                       # eslint + tsc
```

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness probe |
| POST | `/auth/register` | — | Register a new user; returns `{id, username}` |
| POST | `/auth/login` | — | Login; returns `{token}` (24h JWT) |
| GET | `/amenities/:id/reservations?date=<ms>` | — | Reservations for an amenity on a given UTC day |
| GET | `/users/:id/reservations` | — | A user's reservations, grouped by UTC date |
| POST | `/csv/parse` | **JWT** | Stream-parse a CSV request body; returns JSON array |
| GET | `/api-docs` | — | Swagger UI |
| GET | `/openapi.json` | — | OpenAPI 3.0 spec |

## Curl examples

Login as a seeded legacy user (any id 1..100 except 11, 67, 80, 99):

```sh
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"legacy_user_42","password":"Pass123$"}' | jq -r .token)
```

Or register your own:

```sh
curl -X POST localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"eugene","password":"hunter2!"}'
```

Reservations for amenity 8 on 2020-07-04 (UTC midnight = 1593820800000):

```sh
curl "localhost:3000/amenities/8/reservations?date=1593820800000"
```

All reservations for user 42, grouped by day:

```sh
curl localhost:3000/users/42/reservations
```

Stream-parse a CSV body (auth required). The body must be the raw CSV bytes with `Content-Type: text/csv` — this endpoint does not accept `multipart/form-data` uploads, since streaming the body directly keeps memory bounded for arbitrarily large files:

```sh
# inline body
curl -X POST localhost:3000/csv/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: text/csv' \
  --data-binary $'name;value\ngym;100\npool;50'

# or send a file from disk
curl -X POST localhost:3000/csv/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: text/csv' \
  --data-binary @data/amenities.csv
```

## Environment variables

| Name | Default | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://root:rootpassword@localhost:3306/reservations` | MySQL connection URL |
| `JWT_SECRET` | — (required, ≥16 chars) | HMAC secret for signing JWTs |
| `PORT` | `3000` | API listen port |
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root password (compose only) |
| `MYSQL_DATABASE` | `reservations` | DB name (compose only) |

Inside the api container, `DATABASE_URL` is composed from `MYSQL_ROOT_PASSWORD` and `MYSQL_DATABASE` and points at the `mysql` service hostname, so the host's local `DATABASE_URL` (which uses `localhost`) doesn't leak into the container.

## Project layout

```
src/
  config/        env, db client, swagger
  schemas/       zod schemas (request validation + OpenAPI response shapes)
  routes/        express routers
  controllers/   thin request/response glue
  services/      auth, amenity, user, csv, token (unit-tested)
  middleware/    JWT guard, zod validate, error handler
  db/            drizzle schema, queries, seed, migrate-cli
  streams/       JsonArrayTransform for the CSV streaming endpoint
  utils/         time helpers, AppError hierarchy
data/            seed CSV files
drizzle/         generated migrations
tests/           jest unit tests
```
