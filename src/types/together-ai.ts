type Role = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: Role
  content: string
}

export interface TogetherAIResponse {
  choices: {
    message: {
      content: string
      role: string
    }
    finish_reason: string
    index: number
  }[]
  created: number
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatRequestBody {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  max_tokens?: number
}