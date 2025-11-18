// Sentry client configuration
// Note: This is a placeholder. In production, install @sentry/nextjs and configure properly

export function initSentry() {
  if (typeof window === 'undefined') return
  
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  
  if (!dsn) {
    console.warn('[v0] Sentry DSN not configured')
    return
  }

  // In production, you would:
  // import * as Sentry from '@sentry/nextjs'
  // Sentry.init({ dsn, environment: process.env.NODE_ENV })
  
  console.log('[v0] Sentry initialized (placeholder)')
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, { extra: context })
  } else {
    console.error('[v0] Sentry error:', error, context)
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, level)
  } else {
    console.log(`[v0] Sentry ${level}:`, message)
  }
}
