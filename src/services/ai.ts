import { ChatMessage, ChatRequestBody, TogetherAIResponse } from '../types/together-ai'

const API_URL = '/api/chat'
const API_KEY = import.meta.env.VITE_TOGETHER_API_KEY

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>/g, '')
}

// Error handling helper
const handleApiError = (error: any): never => {
  if (error instanceof Response) {
    throw new Error(`API Error: ${error.status} ${error.statusText}`)
  }
  throw error
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    // Validate API key
    if (!API_KEY) {
      throw new Error('API key is not configured')
    }

    // Sanitize all message contents
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: sanitizeInput(msg.content)
    }))

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: sanitizedMessages,
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        temperature: 0.7,
        max_tokens: 1000,
      } as ChatRequestBody),
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      if (response.status === 402) {
        throw new Error('Free message limit exceeded. Please upgrade your plan.')
      }
      handleApiError(response)
    }

    const data: TogetherAIResponse = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from AI service')
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error('Error in sendChatMessage:', error)
    throw error
  }
}

export async function generateCode(prompt: string): Promise<string> {
  const sanitizedPrompt = sanitizeInput(prompt)
  
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a code generation assistant. Provide only the code implementation without any explanation or markdown formatting. 
      Focus on writing clean, efficient, and well-commented code that solves the user's request.`
    },
    {
      role: 'user',
      content: sanitizedPrompt
    }
  ]

  try {
    const response = await sendChatMessage(messages)
    
    // Extract code from potential markdown formatting
    const codeMatch = response.match(/```(?:javascript|js)?\n([\s\S]*?)```/)
    if (codeMatch) {
      return codeMatch[1].trim()
    }
    
    return response.trim()
  } catch (error) {
    console.error('Error in generateCode:', error)
    throw new Error('Failed to generate code. Please try again.')
  }
}