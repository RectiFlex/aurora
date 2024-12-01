import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logError } from '../services/errorLogging'

interface FallbackErrorProps {
  error: Error
  componentStack?: string
  eventId?: string
  resetError?: () => void
}

const FallbackError = ({ 
  error, 
  componentStack,
  resetError 
}: FallbackErrorProps) => {
  useEffect(() => {
    logError(error, { componentStack })
  }, [error, componentStack])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-300" />
        </div>
        
        <h1 className="text-2xl font-semibold mb-2 dark:text-white">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {import.meta.env.DEV 
            ? error.message
            : "We're sorry, but something went wrong. Please try again or contact support if the problem persists."}
        </p>

        {resetError && (
          <button
            onClick={resetError}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

export default FallbackError