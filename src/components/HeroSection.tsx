import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import FloatingParticles from './FloatingParticles'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      <FloatingParticles />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 max-w-4xl mx-auto p-8 rounded-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10"
        >
          <h1 className="font-aurora text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-aurora-gradient text-center tracking-wider">
            AURORA AI
          </h1>
          
          <p className="font-aurora text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center tracking-wide">
            INTELLIGENT • ADAPTIVE • POWERFUL
          </p>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/chat')}
              className="font-aurora px-8 py-4 bg-aurora-gradient text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              START CHATTING
            </motion.button>
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-br from-aurora-purple/5 to-aurora-pink/5 rounded-2xl" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-aurora-purple/10 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-aurora-pink/10 rounded-full filter blur-3xl" />
      </motion.div>
    </motion.div>
  )
}

export default HeroSection