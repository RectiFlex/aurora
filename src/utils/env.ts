interface EnvVar {
  key: string
  required: boolean
  type: 'string' | 'boolean' | 'number'
}

const ENV_VARS: EnvVar[] = [
  { key: 'VITE_TOGETHER_API_KEY', required: true, type: 'string' },
  { key: 'VITE_API_URL', required: true, type: 'string' },
  { key: 'VITE_WS_URL', required: true, type: 'string' },
  { key: 'VITE_ENABLE_ANALYTICS', required: false, type: 'boolean' },
  { key: 'VITE_ENABLE_CHAT_HISTORY', required: false, type: 'boolean' },
  { key: 'VITE_MAX_FREE_MESSAGES', required: true, type: 'number' },
  { key: 'VITE_APP_NAME', required: true, type: 'string' },
  { key: 'VITE_APP_VERSION', required: true, type: 'string' },
  { key: 'VITE_SENTRY_DSN', required: false, type: 'string' },
]

export function validateEnv(): void {
  const errors: string[] = []

  ENV_VARS.forEach(({ key, required, type }) => {
    const value = import.meta.env[key]

    if (required && !value) {
      errors.push(`Missing required environment variable: ${key}`)
      return
    }

    if (value) {
      switch (type) {
        case 'boolean':
          if (value !== 'true' && value !== 'false') {
            errors.push(`Environment variable ${key} must be a boolean`)
          }
          break
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Environment variable ${key} must be a number`)
          }
          break
      }
    }
  })

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
  }
}