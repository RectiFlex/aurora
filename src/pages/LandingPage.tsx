import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bot, Sparkles, MessageSquare, Code2, Zap, Brain, ChevronDown, ChevronUp, Check } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import FeatureCard from '../components/FeatureCard'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const LandingPage = () => {
  const navigate = useNavigate()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  const FAQs: FAQItem[] = [
    {
      question: "What is Aurora AI?",
      answer: "Aurora AI is a cutting-edge artificial intelligence assistant designed to help with conversations, coding, and various tasks. It combines natural language processing with advanced AI capabilities to provide human-like interactions."
    },
    {
      question: "How can I get started?",
      answer: "Getting started is easy! Simply click the 'Try Aurora Chat Now' button and begin your conversation. No complex setup or configuration required."
    },
    {
      question: "Is my data secure?",
      answer: "We take data security seriously. All conversations are encrypted and we never store sensitive personal information. Your privacy is our top priority."
    },
    {
      question: "What types of tasks can Aurora help with?",
      answer: "Aurora can assist with a wide range of tasks including general conversation, coding assistance, problem-solving, and more. It's constantly learning and improving to better serve your needs."
    }
  ]

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Advanced AI",
      description: "Powered by cutting-edge language models for human-like interactions"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Smart Responses",
      description: "Contextual and intelligent responses that adapt to your needs"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Natural Dialog",
      description: "Engage in flowing conversations that feel natural and intuitive"
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: "Code Assistant",
      description: "Get help with coding, debugging, and technical problems"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Always ready to help, whenever you need assistance"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast & Reliable",
      description: "Quick responses and high availability for seamless interaction"
    }
  ]

  const pricingPlans = [
    {
      name: "Basic",
      description: "Perfect for getting started with AI assistance",
      price: isAnnual ? 99 : 9.99,
      features: [
        "Unlimited AI conversations",
        "Basic code assistance",
        "Standard response time",
        "Email support",
      ],
    },
    {
      name: "Professional",
      description: "Ideal for power users and developers",
      price: isAnnual ? 199 : 19.99,
      features: [
        "Everything in Basic",
        "Priority response time",
        "Advanced code analysis",
        "Custom AI training",
        "Priority support",
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      price: isAnnual ? 499 : 49.99,
      features: [
        "Everything in Professional",
        "Dedicated support",
        "Custom integrations",
        "Team collaboration",
        "Advanced analytics",
        "SLA guarantees",
      ],
    },
  ]

  return (
    <div className="relative overflow-hidden">
      <HeroSection />
      
      {/* How it Works Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            How Aurora Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500" />
            
            {/* Steps */}
            {[
              { number: "01", title: "Ask Your Question", description: "Type your query or upload your code" },
              { number: "02", title: "AI Processing", description: "Aurora analyzes and processes your input" },
              { number: "03", title: "Get Results", description: "Receive intelligent, contextual responses" }
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="absolute -top-4 left-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {step.number}
                </div>
                <h3 className="mt-4 text-xl font-semibold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Feature Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Powerful Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24 bg-gradient-to-b from-transparent via-purple-50/50 to-transparent dark:from-transparent dark:via-gray-800/50 dark:to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include access to our core AI features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Monthly billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ease-in-out ${
                isAnnual ? 'bg-purple-600' : 'bg-gray-400'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500'}`}>
              Annual billing
              <span className="ml-1 text-green-500 font-medium">
                (Save 20%)
              </span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className={`relative p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border-2 shadow-xl ${
                  plan.recommended
                    ? 'border-purple-500 dark:border-purple-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full">
                    Recommended
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2 dark:text-white">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300">/{isAnnual ? 'year' : 'month'}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/auth')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            What Users Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Aurora has completely transformed how I approach coding problems. It's like having a senior developer by my side 24/7.",
                author: "Sarah Chen",
                role: "Software Engineer"
              },
              {
                text: "The natural conversation flow and intelligent responses make it feel like I'm chatting with a real person. Impressive!",
                author: "Michael Roberts",
                role: "Product Manager"
              },
              {
                text: "As a student, having Aurora to help explain complex concepts has been invaluable. It's like having a personal tutor.",
                author: "James Wilson",
                role: "CS Student"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <p className="text-gray-600 dark:text-gray-300 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-colors"
                >
                  <span className="font-medium text-left dark:text-white">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-700/80">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-6 py-24 mb-20 bg-gradient-to-b from-transparent to-purple-100/50 dark:to-gray-800/50"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Ready to experience the future?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users already benefiting from Aurora AI's capabilities.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Try Aurora Chat Now
          </button>
        </div>
      </motion.div>

      {/* Aurora Background Effect */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-50 dark:opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>
    </div>
  )
}

export default LandingPage