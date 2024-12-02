import { init, captureException } from '@sentry/react'
import { Integrations, Intergration } from '@sentry/tracing'

export const initErrorLogging = () => {
  if (import.meta.env.PROD) {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Integrations.BrowserTracing() as unknown as Integration
      ],
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