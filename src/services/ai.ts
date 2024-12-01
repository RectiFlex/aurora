import { ChatMessage, ChatRequestBody, TogetherAIResponse } from '../types/together-ai'

const API_URL = '/api/chat'

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        temperature: 0.7,
        max_tokens: 1000,
      } as ChatRequestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get AI response: ${error}`)
    }

    const data: TogetherAIResponse = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error in sendChatMessage:', error)
    throw error
  }
}

export async function generateCode(prompt: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a code generation assistant. Provide only the code implementation without any explanation or markdown formatting. 
      Focus on writing clean, efficient, and well-commented code that solves the user's request.`
    },
    {
      role: 'user',
      content: prompt
    }
  ]

  const response = await sendChatMessage(messages)
  
  // Extract code from potential markdown formatting
  const codeMatch = response.match(/```(?:javascript|js)?\n([\s\S]*?)```/)
  if (codeMatch) {
    return codeMatch[1].trim()
  }
  
  return response.trim()
}