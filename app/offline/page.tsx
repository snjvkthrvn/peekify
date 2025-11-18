import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center">
            <WifiOff className="h-10 w-10 text-warning" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">You're Offline</h1>
          <p className="text-foreground-secondary text-balance">
            It looks like you've lost your internet connection. Some features may not be available until you're back online.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={() => window.location.reload()} size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/feed">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="pt-8 text-sm text-foreground-tertiary">
          <p>Your recent data may still be available from cache</p>
        </div>
      </div>
    </div>
  )
}
