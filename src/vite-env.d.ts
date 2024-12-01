/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOGETHER_API_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_CHAT_HISTORY: string
  readonly VITE_MAX_FREE_MESSAGES: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}