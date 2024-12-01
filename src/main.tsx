import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initErrorLogging } from './services/errorLogging'
import { validateEnv } from './utils/env'
import './index.css'

// Validate environment variables
validateEnv()

// Initialize error logging
initErrorLogging()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <App />
    </Suspense>
  </StrictMode>,
)