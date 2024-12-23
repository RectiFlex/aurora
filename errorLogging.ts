import { init, captureException } from '@sentry/react'

export const initErrorLogging = () => {
  if (import.meta.env.PROD) {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      tracesSampleRate: 1.0,
      enabled: import.meta.env.PROD,
    })
  }
}

export const logError = (error: Error, context?: Record<string, any>) => {
  console.error(error)
  
  if (import.meta.env.PROD) {
    captureException(error, {
      extra: context
    })
  }
}