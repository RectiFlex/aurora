import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const redis = Redis.fromEnv()

// Create rate limiter instance
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
})

interface RateLimitResponse {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResponse> {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  
  return {
    success,
    limit,
    remaining,
    reset,
  }
}