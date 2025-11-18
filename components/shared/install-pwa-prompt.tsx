"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa-prompt-dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log('[v0] PWA install outcome:', outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slide-up">
      <div className="rounded-lg border border-border bg-background-secondary p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-accent-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">Install Replay</h3>
            <p className="text-sm text-foreground-secondary mb-3">
              Install Replay for quick access and offline support
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not Now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-foreground-tertiary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
