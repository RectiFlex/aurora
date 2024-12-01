import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  subscription: varchar('subscription', { length: 50 }).default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  userId: serial('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull()
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Message = typeof messages.$inferSelect