"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Music, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed')
    }
  }, [user, loading, router])

  const handleSpotifyLogin = () => {
    authApi.initiateSpotifyAuth()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
            <Music className="h-8 w-8 text-accent-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Replay</h1>
          <p className="text-foreground-secondary">
            Connect your Spotify account to start tracking your daily music journey
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <Button
            size="lg"
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-background font-semibold"
            onClick={handleSpotifyLogin}
          >
            <Music className="h-5 w-5 mr-2" />
            Continue with Spotify
          </Button>

          <p className="text-xs text-foreground-tertiary">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            We'll only access your listening history.
          </p>
        </div>

        <div className="pt-8 space-y-4 text-sm text-foreground-secondary">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary">
            <div className="h-2 w-2 rounded-full bg-accent-primary" />
            <div className="text-left">
              <div className="font-medium text-foreground">Private by Default</div>
              <div>Only friends you add can see your music</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary">
            <div className="h-2 w-2 rounded-full bg-accent-primary" />
            <div className="text-left">
              <div className="font-medium text-foreground">Passive Tracking</div>
              <div>Just listen as usual, we'll handle the rest</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary">
            <div className="h-2 w-2 rounded-full bg-accent-primary" />
            <div className="text-left">
              <div className="font-medium text-foreground">Daily Reveals</div>
              <div>Get notified at 9:30pm every evening</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
