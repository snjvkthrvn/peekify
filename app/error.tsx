"use client"

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Page error:', error)
    
    // Send to Sentry in production
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center animate-fade-in">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-error/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-error" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-balance">Oops! Something went wrong</h1>
          <p className="text-lg text-foreground-secondary text-balance">
            We encountered an unexpected error while loading this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/feed'}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-sm bg-background-secondary p-4 rounded-lg border border-border">
            <summary className="cursor-pointer font-semibold mb-2 text-error">
              Error Details (Development Only)
            </summary>
            <pre className="overflow-x-auto text-xs mt-2 text-foreground-tertiary">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
