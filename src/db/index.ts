import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Get database connection string from environment variable
const sql = neon(process.env.NEON_DATABASE_URL!)

// Create drizzle database instance
export const db = drizzle(sql, { schema })

// Helper functions for common database operations
export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(schema.users).where(sql`email = ${email}`)
  return user
}

export async function getUserBySessionToken(token: string) {
  const [session] = await db
    .select({
      user: schema.users,
      session: schema.sessions
    })
    .from(schema.sessions)
    .innerJoin(schema.users, sql`${schema.users.id} = ${schema.sessions.userId}`)
    .where(sql`${schema.sessions.token} = ${token}`)

  return session?.user
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
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash,
      subscription: 'free'
    })
    .returning()

  return user
}

export async function getUserMessageCount(userId: number) {
  const [result] = await db
    .select({
      count: sql<number>`count(*)`
    })
    .from(schema.messages)
    .where(sql`user_id = ${userId}`)

  return result?.count ?? 0
}

export async function createMessage(userId: number, content: string) {
  const [message] = await db
    .insert(schema.messages)
    .values({
      userId,
      content
    })
    .returning()

  return message
}