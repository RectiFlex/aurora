import { ChatRequestBody, TogetherAIResponse } from '../src/types/together-ai'
import { getUserBySessionToken, getUserMessageCount, createMessage } from '../src/db'

export const config = {
  runtime: 'edge'
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Get session token from cookie
    const sessionToken = req.headers.get('cookie')?.split('session=')?.[1]?.split(';')?.[0]
    
    // Get user from session
    const user = sessionToken ? await getUserBySessionToken(sessionToken) : null
    const subscription = user?.subscription || 'free'

    // Check message limits for free users
    if (!user || subscription === 'free') {
      const messageCount = user ? await getUserMessageCount(user.id) : 0
      if (messageCount >= 5) {
        return new Response(
          JSON.stringify({ error: 'Free message limit exceeded' }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        )
      }
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

    // Store message in database if user is authenticated
    if (user) {
      await createMessage(
        user.id,
        body.messages[body.messages.length - 1].content
      )
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
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