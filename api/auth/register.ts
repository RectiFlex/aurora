import { VercelRequest, VercelResponse } from '@vercel/edge'
import { Redis } from '@upstash/redis'
import { hash } from '@vercel/edge/crypto'

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

    // Check if user already exists
    const existingUser = await redis.get(`user:${email}`)
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Hash password
    const passwordHash = await hash(password)

    // Create user
    const user = {
      email,
      passwordHash,
      subscription: 'free',
      createdAt: new Date().toISOString()
    }

    await redis.set(`user:${email}`, JSON.stringify(user))

    return new Response(
      JSON.stringify({ message: 'User created successfully' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}