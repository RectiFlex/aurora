import { SHA256 } from 'crypto-js'
import { getUserByEmail, createUser } from '../../src/db'
import { corsHeaders } from '../../src/middleware/cors'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders(req.headers.get('origin') ?? undefined)
    })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(req.headers.get('origin') ?? undefined)
          }
        }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(req.headers.get('origin') ?? undefined)
          }
        }
      )
    }

    // Hash password and create user
    const passwordHash = SHA256(password).toString()
    await createUser(email, passwordHash)

    return new Response(
      JSON.stringify({ message: 'User created successfully' }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(req.headers.get('origin') ?? undefined)
        }
      }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(req.headers.get('origin') ?? undefined)
        }
      }
    )
  }
}