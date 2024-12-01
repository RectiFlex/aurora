import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'

interface NavbarProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
}

const Navbar = ({ darkMode, setDarkMode }: NavbarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-2 py-2">
      <nav className="inline-flex rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5">
        <div className="px-4 py-2">
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-lg font-bold font-aurora bg-clip-text text-transparent bg-aurora-gradient hover:opacity-80 transition-opacity"
            >
              AURORA
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/chat" 
                className="text-sm font-aurora text-gray-600 dark:text-gray-300 hover:text-aurora-purple dark:hover:text-aurora-pink transition-colors"
              >
                Chat
              </Link>
              <Link 
                to="/aurocoder" 
                className="text-sm font-aurora text-gray-600 dark:text-gray-300 hover:text-aurora-purple dark:hover:text-aurora-pink transition-colors"
              >
                CodeAssist
              </Link>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar