type EventType = 'page_view' | 'chat_message' | 'error' | 'subscription_changed'

interface AnalyticsEvent {
  type: EventType
  properties?: Record<string, any>
}

class Analytics {
  private isEnabled: boolean

  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  }

  public trackEvent({ type, properties = {} }: AnalyticsEvent) {
    if (!this.isEnabled) return

    // Here you would typically send to your analytics service
    // For now, we'll just log to console in production
    if (import.meta.env.PROD) {
      console.log('[Analytics]', {
        type,
        properties,
        timestamp: new Date().toISOString(),
      })
    }
  }

  public trackError(error: Error) {
    this.trackEvent({
      type: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
      },
    })
  }

  public trackPageView(page: string) {
    this.trackEvent({
      type: 'page_view',
      properties: {
        page,
        referrer: document.referrer,
      },
    })
  }
}

export const analytics = new Analytics()