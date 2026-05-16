import { mysqlTable, int, varchar, bigint, timestamp, index } from 'drizzle-orm/mysql-core';

export const amenities = mysqlTable('amenities', {
  id: int('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const reservations = mysqlTable(
  'reservations',
  {
    id: int('id').primaryKey(),
    amenityId: int('amenity_id').notNull().references(() => amenities.id),
    userId: int('user_id').notNull(),
    startTime: int('start_time').notNull(),
    endTime: int('end_time').notNull(),
    date: bigint('date', { mode: 'number' }).notNull(),
  },
  (t) => [
    index('idx_amenity_date').on(t.amenityId, t.date),
    index('idx_user').on(t.userId),
  ],
);

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Amenity = typeof amenities.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
