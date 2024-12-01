import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState, createContext } from 'react'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import AurocoderPage from './pages/AurocoderPage'
import AuthPage from './pages/AuthPage'
import Navbar from './components/Navbar'
import './index.css'

export const ThemeContext = createContext<{
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}>({ darkMode: false, setDarkMode: () => {} })

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  return (
    <BrowserRouter>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/aurocoder" element={<AurocoderPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </div>
        </div>
      </ThemeContext.Provider>
    </BrowserRouter>
  )
}

export default App