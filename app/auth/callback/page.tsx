"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authorization failed. Please try again.')
        return
      }

      if (!code) {
        setError('No authorization code received.')
        return
      }

      try {
        await authApi.handleCallback(code)
        await refreshUser()
        router.push('/onboarding')
      } catch (err) {
        console.error('[v0] Callback error:', err)
        setError(err instanceof Error ? err.message : 'Failed to complete authorization')
      }
    }

    handleCallback()
  }, [searchParams, router, refreshUser])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-error" />
          </div>
          <h1 className="text-2xl font-bold">Something Went Wrong</h1>
          <p className="text-foreground-secondary">{error}</p>
          <Button onClick={() => router.push('/auth/login')}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent-primary mx-auto" />
        <h1 className="text-xl font-semibold">Connecting your Spotify...</h1>
        <p className="text-foreground-secondary">This will only take a moment</p>
      </div>
    </div>
  )
}
