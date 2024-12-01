import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

interface AuthResponse {
  isAuthenticated: boolean
  subscription: string
  email?: string
}

export async function authenticateRequest(request: Request): Promise<AuthResponse> {
  const sessionToken = request.headers.get('cookie')?.split('session=')?.[1]?.split(';')?.[0]

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