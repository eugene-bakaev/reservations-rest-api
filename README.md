# reservations-rest-api

A REST API for querying amenity reservations, built with Node.js, Express, TypeScript, and MySQL.

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for MySQL)

## Setup

```sh
pnpm install
cp .env.example .env
```

## Database

Start MySQL:

```sh
docker-compose up -d mysql
```

Run migrations:

```sh
pnpm db:migrate
```

This creates the tables.

## Development

```sh
pnpm dev
```

Server starts at `http://localhost:3000`. Health check: `GET /health`.
