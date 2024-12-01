import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Lock, CreditCard, CheckCircle, X } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  price: string
  features: string[]
  recommended?: boolean
}

const AuthPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99/month',
      features: [
        'Unlimited AI conversations',
        'Basic code assistance',
        'Standard response time',
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$19.99/month',
      features: [
        'Everything in Basic',
        'Priority response time',
        'Advanced code analysis',
        'Custom AI training'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$49.99/month',
      features: [
        'Everything in Professional',
        'Dedicated support',
        'Custom integrations',
        'Team collaboration',
        'Advanced analytics'
      ]
    }
  ]

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle authentication here
    // For demo, we'll just simulate success
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('subscription', selectedPlan || 'basic')
    localStorage.setItem('messageCount', '0')
    navigate('/chat')
  }

  return (
    <div className="min-h-screen pt-20 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {isLogin ? 'Welcome Back' : 'Get Started with Aurora AI'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {isLogin 
              ? 'Sign in to continue your AI journey' 
              : 'Choose a plan and create your account to unlock unlimited AI conversations'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-2xl shadow-lg backdrop-blur-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2 dark:text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {isLogin 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </motion.div>

          {/* Subscription Plans */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border-2 transition-colors cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
                    RECOMMENDED
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white">{plan.name}</h3>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {plan.price}
                    </div>
                  </div>
                  {selectedPlan === plan.id && (
                    <CheckCircle className="w-6 h-6 text-purple-500" />
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage