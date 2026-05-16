import { and, eq, inArray, sql } from 'drizzle-orm';
import type { DB } from '../config/db';
import { amenities, reservations, users, type Amenity, type Reservation, type User, type NewUser } from './schema';

export type AmenityQueries = {
  findById(id: number): Promise<Amenity | undefined>;
  findManyByIds(ids: number[]): Promise<Amenity[]>;
  countAll(): Promise<number>;
  insertMany(rows: Amenity[]): Promise<void>;
};

export type ReservationQueries = {
  findByAmenityAndDate(amenityId: number, date: number): Promise<Reservation[]>;
  findByUserId(userId: number): Promise<Reservation[]>;
  insertMany(rows: Reservation[]): Promise<void>;
  distinctUserIds(): Promise<number[]>;
};

export type LegacyUserRow = {
  id: number;
  username: string;
  passwordHash: string;
};

export type UserQueries = {
  findByUsername(username: string): Promise<User | undefined>;
  insert(row: NewUser): Promise<{ id: number }>;
  countAll(): Promise<number>;
  insertManyWithIds(rows: LegacyUserRow[]): Promise<void>;
};

export function makeAmenityQueries(db: DB): AmenityQueries {
  return {
    async findById(id) {
      const rows = await db.select().from(amenities).where(eq(amenities.id, id)).limit(1);
      return rows[0];
    },
    async findManyByIds(ids) {
      if (ids.length === 0) return [];
      return db.select().from(amenities).where(inArray(amenities.id, ids));
    },
    async countAll() {
      const [row] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(amenities);
      return row?.count ?? 0;
    },
    async insertMany(rows) {
      if (rows.length === 0) return;
      await db.insert(amenities).values(rows);
    },
  };
}

export function makeReservationQueries(db: DB): ReservationQueries {
  return {
    findByAmenityAndDate(amenityId, date) {
      return db.select().from(reservations).where(
        and(eq(reservations.amenityId, amenityId), eq(reservations.date, date)),
      );
    },
    findByUserId(userId) {
      return db.select().from(reservations).where(eq(reservations.userId, userId));
    },
    async insertMany(rows) {
      if (rows.length === 0) return;
      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        await db.insert(reservations).values(rows.slice(i, i + CHUNK));
      }
    },
    async distinctUserIds() {
      const rows = await db
        .selectDistinct({ userId: reservations.userId })
        .from(reservations);
      return rows.map((row) => row.userId);
    },
  };
}

export function makeUserQueries(db: DB): UserQueries {
  return {
    async findByUsername(username) {
      const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return rows[0];
    },
    async insert(row) {
      const [{ id }] = await db.insert(users).values(row).$returningId();
      return { id };
    },
    async countAll() {
      const [row] = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(users);
      return row?.count ?? 0;
    },
    async insertManyWithIds(rows) {
      if (rows.length === 0) return;
      await db.insert(users).values(rows);
    },
  };
}
