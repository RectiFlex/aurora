import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { ChatRequestBody, TogetherAIResponse } from '../src/types/together-ai'

export const config = {
  runtime: 'edge'
}

// Create Redis instance
const redis = Redis.fromEnv()

// Create rate limiter
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
})

// Middleware to check authentication
async function authenticateRequest(req: Request): Promise<{
  isAuthenticated: boolean;
  subscription: string;
  email?: string;
}> {
  const sessionToken = req.headers.get('cookie')?.split('session=')?.[1]?.split(';')?.[0]

  if (!sessionToken) {
    return { isAuthenticated: false, subscription: 'free' }
  }

  const userEmail = await redis.get(`session:${sessionToken}`)
  if (!userEmail) {
    return { isAuthenticated: false, subscription: 'free' }
  }

  const user = await redis.get(`user:${userEmail}`)
  if (!user) {
    return { isAuthenticated: false, subscription: 'free' }
  }

  return {
    isAuthenticated: true,
    subscription: (user as any).subscription,
    email: userEmail as string
  }
}

export default async function handler(
  req: Request
) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Authenticate request
    const { isAuthenticated, subscription, email } = await authenticateRequest(req)

    // Apply rate limiting
    const identifier = email || req.headers.get('x-forwarded-for') || 'anonymous'
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          limit,
          reset,
          remaining
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      )
    }

    // Check message limits for free users
    if (!isAuthenticated && subscription === 'free') {
      const messageCount = await redis.get(`messages:${identifier}`) || 0
      if (Number(messageCount) >= 5) {
        return new Response(
          JSON.stringify({ error: 'Free message limit exceeded' }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        )
      }
      await redis.incr(`messages:${identifier}`)
    }

    const body: ChatRequestBody = await req.json()

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: body.messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 1000,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get AI response')
    }

    const data: TogetherAIResponse = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}