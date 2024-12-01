import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, MessageSquarePlus, MessageSquare } from 'lucide-react'

interface Chat {
  id: string
  name: string
  lastMessage?: string
  timestamp: number
}

interface ChatSidebarProps {
  chats: Chat[]
  activeChat: string
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const ChatSidebar = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? '60px' : '240px',
          transition: { duration: 0.2 },
        }}
        className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={`absolute -right-3 top-4 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md z-10 
            ${(isHovered || !isCollapsed) ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </motion.div>
        </button>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  New Chat
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100%-70px)]">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full flex items-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                ${chat.id === activeChat ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            >
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-0 text-left"
                  >
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {chat.name}
                    </div>
                    {chat.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ChatSidebar