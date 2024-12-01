import { Send, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import ChatSidebar from '../components/ChatSidebar'
import SubscriptionModal from '../components/SubscriptionModal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendChatMessage } from '../services/ai'
import type { ChatMessage as AIMessage } from '../types/together-ai'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

interface Chat {
  id: string
  name: string
  messages: Message[]
  lastMessage?: string
  timestamp: number
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  text: "Hello! I'm Aurora, your AI assistant. How can I help you today?",
  sender: 'bot'
}

const INITIAL_CHAT: Chat = {
  id: '1',
  name: 'New Chat',
  messages: [INITIAL_MESSAGE],
  lastMessage: INITIAL_MESSAGE.text,
  timestamp: Date.now(),
}

const FREE_MESSAGE_LIMIT = 2
const SYSTEM_PROMPT = `You are Aurora, an advanced AI assistant. You are helpful, friendly, and knowledgeable. 
You provide clear and concise answers while maintaining a supportive and engaging tone.`

const ChatPage = () => {
  const navigate = useNavigate()
  const [chats, setChats] = useLocalStorage<Chat[]>('aurora-chats', [INITIAL_CHAT])
  const [activeChat, setActiveChat] = useState(INITIAL_CHAT.id)
  const [input, setInput] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [messageCount, setMessageCount] = useLocalStorage('messageCount', '0')
  
  const currentChat = chats.find(chat => chat.id === activeChat) || INITIAL_CHAT

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const subscription = localStorage.getItem('subscription')
    
    // Reset message count if user is authenticated
    if (isAuthenticated && subscription) {
      setMessageCount('0')
    }
  }, [])

  const checkMessageLimit = (): boolean => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    const subscription = localStorage.getItem('subscription')
    const count = parseInt(messageCount)

    if (!isAuthenticated && count >= FREE_MESSAGE_LIMIT) {
      setShowSubscriptionModal(true)
      return false
    }

    return true
  }

  const formatMessagesForAI = (messages: Message[]): AIMessage[] => {
    const aiMessages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    messages.forEach(msg => {
      aiMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })
    })

    return aiMessages
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    if (!checkMessageLimit()) return

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user'
    }

    const updatedChats = chats.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: input,
          timestamp: Date.now(),
        }
      }
      return chat
    })

    setChats(updatedChats)
    setInput('')
    setIsLoading(true)

    // Increment message count for free users
    if (!localStorage.getItem('isAuthenticated')) {
      const newCount = parseInt(messageCount) + 1
      setMessageCount(newCount.toString())
    }

    try {
      const currentMessages = updatedChats.find(chat => chat.id === activeChat)?.messages || []
      const aiMessages = formatMessagesForAI(currentMessages)
      const response = await sendChatMessage(aiMessages)

      const botResponse: Message = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot'
      }
      
      const updatedChatsWithResponse = updatedChats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage, botResponse],
            lastMessage: botResponse.text,
            timestamp: Date.now(),
          }
        }
        return chat
      })

      setChats(updatedChatsWithResponse)
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: 'bot'
      }
      
      const updatedChatsWithError = updatedChats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage, errorMessage],
            lastMessage: errorMessage.text,
            timestamp: Date.now(),
          }
        }
        return chat
      })

      setChats(updatedChatsWithError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `New Chat ${chats.length + 1}`,
      messages: [INITIAL_MESSAGE],
      lastMessage: INITIAL_MESSAGE.text,
      timestamp: Date.now(),
    }

    setChats([...chats, newChat])
    setActiveChat(newChat.id)
  }

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear this chat?')) {
      const updatedChats = chats.map(chat => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [INITIAL_MESSAGE],
            lastMessage: INITIAL_MESSAGE.text,
            timestamp: Date.now(),
          }
        }
        return chat
      })
      setChats(updatedChats)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-6 px-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg flex overflow-hidden">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          onNewChat={handleNewChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {currentChat.name}
            </h2>
            <button
              onClick={clearHistory}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentChat.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                disabled={isLoading}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={isLoading}
                className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 transition-opacity ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
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