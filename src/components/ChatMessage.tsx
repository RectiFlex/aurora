import { motion } from 'framer-motion'

export interface UIMessage {
  id: number
  content: string
  sender: 'user' | 'bot'
}

interface ChatMessageProps {
  message: UIMessage
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isBot = message.sender === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isBot
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  )
}

export default ChatMessage