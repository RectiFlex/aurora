import { motion } from 'framer-motion'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

interface ChatMessageProps {
  message: Message
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
        {message.text}
      </div>
    </motion.div>
  )
}

export default ChatMessage