import { Send, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
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
  timestamp: number
}

const ChatPage = () => {
  const [chats, setChats] = useLocalStorage<Chat[]>('chats', [])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (chats.length === 0) {
      createNewChat()
    } else if (!activeChat) {
      setActiveChat(chats[0].id)
    }
  }, [chats])

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      timestamp: Date.now()
    }
    setChats([newChat, ...chats])
    setActiveChat(newChat.id)
  }

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat) return

    const currentChat = getCurrentChat()
    if (!currentChat) return

    const userMessage: Message = {
      id: currentChat.messages.length + 1,
      text: inputMessage,
      sender: 'user'
    }

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage]
    }

    setChats(chats.map(chat => 
      chat.id === activeChat ? updatedChat : chat
    ))
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiMessages: AIMessage[] = [
        { role: 'system' as const, content: 'You are Aurora, a helpful AI assistant.' },
        ...currentChat.messages.map(msg => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as const,
          content: msg.text
        })),
        { role: 'user' as const, content: inputMessage }
      ]

      const response = await sendChatMessage(aiMessages)

      const botMessage: Message = {
        id: updatedChat.messages.length + 1,
        text: response,
        sender: 'bot'
      }

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, botMessage]
      }

      setChats(chats.map(chat => 
        chat.id === activeChat ? finalChat : chat
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

  const clearChat = () => {
    if (!activeChat) return
    const updatedChat = {
      ...getCurrentChat()!,
      messages: []
    }
    setChats(chats.map(chat => 
      chat.id === activeChat ? updatedChat : chat
    ))
  }

  return (
    <div className="flex h-screen pt-16">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat || ''}
        onChatSelect={setActiveChat}
        onNewChat={createNewChat}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {getCurrentChat()?.messages.map((message) => (
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
              onClick={clearChat}
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