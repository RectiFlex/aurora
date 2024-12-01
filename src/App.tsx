import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState, createContext, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import AurocoderPage from './pages/AurocoderPage'
import AuthPage from './pages/AuthPage'
import Navbar from './components/Navbar'
import './index.css'

// Create theme context with proper typing
interface ThemeContextType {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
})

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
  </div>
)

// Environment variables validation
const validateEnv = () => {
  const required = ['VITE_TOGETHER_API_KEY']
  const missing = required.filter(key => !import.meta.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    // Validate environment variables
    validateEnv()

    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
          <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
              <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/aurocoder" element={<AurocoderPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </ThemeContext.Provider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App