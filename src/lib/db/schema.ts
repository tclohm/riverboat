import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const passes = sqliteTable('passes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  owner: text('owner').notNull(),
  price: integer('price').notNull(),
  passType: text('pass_type').notNull(),
  availableDates: text('available_dates').notNull(),
})
