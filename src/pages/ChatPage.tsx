import { Send, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import ChatMessage, { UIMessage } from '../components/ChatMessage'
import ChatSidebar from '../components/ChatSidebar'
import SubscriptionModal from '../components/SubscriptionModal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendChatMessage } from '../services/ai'
import type { ChatMessage as AIChatMessage } from '../types/together-ai'

interface ChatSession {
  id: string
  name: string
  messages: UIMessage[]
  timestamp: number
}

type AIRole = 'system' | 'user' | 'assistant'

const convertToAIRole = (sender: 'user' | 'bot'): AIRole => {
  return sender === 'user' ? 'user' : 'assistant'
}

const systemMessage: AIChatMessage = {
  role: 'system',
  content: 'You are Aurora, a helpful AI assistant.'
}

const ChatPage = () => {
  const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>('chat_sessions', [])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (chatSessions.length === 0) {
      createNewChatSession()
    } else if (!activeChatId) {
      setActiveChatId(chatSessions[0].id)
    }
  }, [chatSessions])

  const createNewChatSession = () => {
    const newChatSession: ChatSession = {
      id: crypto.randomUUID(),
      name: `Chat ${chatSessions.length + 1}`,
      messages: [],
      timestamp: Date.now()
    }
    setChatSessions([newChatSession, ...chatSessions])
    setActiveChatId(newChatSession.id)
  }

  const getCurrentChatSession = () => {
    return chatSessions.find(chat => chat.id === activeChatId)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChatId) return

    const currentChatSession = getCurrentChatSession()
    if (!currentChatSession) return

    const userMessage: UIMessage = {
      id: currentChatSession.messages.length + 1,
      content: inputMessage,
      sender: 'user'
    }

    const updatedChatSession = {
      ...currentChatSession,
      messages: [...currentChatSession.messages, userMessage]
    }

    setChatSessions(chatSessions.map(chat => 
      chat.id === activeChatId ? updatedChatSession : chat
    ))
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiMessages: AIChatMessage[] = [
        systemMessage,
        ...currentChatSession.messages.map(msg => ({
          role: convertToAIRole(msg.sender),
          content: msg.content
        })),
        {
          role: 'user' as AIRole,
          content: inputMessage
        }
      ]

      const response = await sendChatMessage(aiMessages)

      const botMessage: UIMessage = {
        id: updatedChatSession.messages.length + 1,
        content: response,
        sender: 'bot'
      }

      const finalChatSession: ChatSession = {
        ...updatedChatSession,
        messages: [...updatedChatSession.messages, botMessage]
      }

      setChatSessions(chatSessions.map(chat => 
        chat.id === activeChatId ? finalChatSession : chat
      ))
    } catch (error) {
      console.error('Error getting AI response:', error)
      if (error instanceof Error && error.message.includes('402')) {
        setShowSubscriptionModal(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearCurrentChat = () => {
    if (!activeChatId) return
    const updatedChatSession: ChatSession = {
      ...getCurrentChatSession()!,
      messages: []
    }
    setChatSessions(chatSessions.map(chat => 
      chat.id === activeChatId ? updatedChatSession : chat
    ))
  }

  return (
    <div className="flex h-screen pt-16">
      <ChatSidebar
        chats={chatSessions}
        activeChat={activeChatId || ''}
        onChatSelect={setActiveChatId}
        onNewChat={createNewChatSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {getCurrentChatSession()?.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="max-w-4xl mx-auto flex gap-4">
            <button
              onClick={clearCurrentChat}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 rounded-r-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  )
}

export default ChatPage