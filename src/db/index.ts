import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, and } from 'drizzle-orm'
import * as schema from './schema'

// Get database connection string from environment variable
const sql = neon(process.env.NEON_DATABASE_URL!)

// Create drizzle database instance
export const db = drizzle(sql, { schema })

// Helper functions for common database operations
export async function getUserByEmail(email: string) {
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
  return users[0]
}

export async function getUserBySessionToken(token: string) {
  const sessions = await db
    .select({
      user: schema.users
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(eq(schema.sessions.token, token))

  return sessions[0]?.user
}

export async function createSession(userId: number, token: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 1) // 24 hours from now

  await db.insert(schema.sessions).values({
    userId,
    token,
    expiresAt
  })
}

export async function createUser(email: string, passwordHash: string) {
  const result = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash,
      subscription: 'free'
    })
    .returning()

  return result[0]
}

export async function getUserMessageCount(userId: number) {
  const result = await db
    .select({
      count: sql`count(*)`
    })
    .from(schema.messages)
    .where(eq(schema.messages.userId, userId))

  return Number(result[0]?.count) || 0
}

export async function createMessage(userId: number, content: string) {
  const result = await db
    .insert(schema.messages)
    .values({
      userId,
      content
    })
    .returning()

  return result[0]
}