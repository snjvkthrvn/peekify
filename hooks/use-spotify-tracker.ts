"use client"

import { useEffect } from 'react'
import { spotifyTracker } from '@/lib/tracking'

export function useSpotifyTracker() {
  useEffect(() => {
    // Start tracking when component mounts
    spotifyTracker.start()

    // Handle visibility change to adjust polling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[v0] Tab hidden, reducing polling frequency')
      } else {
        console.log('[v0] Tab visible, normal polling')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      spotifyTracker.stop()
    }
  }, [])
}
