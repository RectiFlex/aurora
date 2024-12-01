import { VercelRequest, VercelResponse } from '@vercel/edge'
import { Redis } from '@upstash/redis'
import { hash, compare } from '@vercel/edge/crypto'

export const config = {
  runtime: 'edge',
}

const redis = Redis.fromEnv()

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user from Redis
    const user = await redis.get(`user:${email}`)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify password
    const isValid = await compare(password, (user as any).passwordHash)

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate session token
    const sessionToken = crypto.randomUUID()
    await redis.set(`session:${sessionToken}`, email, { ex: 24 * 60 * 60 }) // 24 hours expiry

    return new Response(
      JSON.stringify({
        token: sessionToken,
        user: {
          email: email,
          subscription: (user as any).subscription
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `session=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${24 * 60 * 60}`
        }
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}