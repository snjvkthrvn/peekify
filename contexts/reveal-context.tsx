"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { RevealScreen } from '@/components/feed/reveal-screen'
import type { SongOfTheDay } from '@/types'
import { trackingApi } from '@/lib/api'
import { showLocalNotification } from '@/lib/notifications'

interface RevealContextType {
  showReveal: (song: SongOfTheDay) => void
}

const RevealContext = createContext<RevealContextType | undefined>(undefined)

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const [revealSong, setRevealSong] = useState<SongOfTheDay | null>(null)
  const [hasShownReveal, setHasShownReveal] = useState(false)

  useEffect(() => {
    // Check if there's a song ready to reveal
    const checkForReveal = async () => {
      const now = new Date()
      const hour = now.getHours()
      const minutes = now.getMinutes()

      // Check if it's 9:30pm or later and we haven't shown reveal yet today
      if ((hour === 21 && minutes >= 30) || hour > 21) {
        const today = now.toISOString().split('T')[0]
        const lastShown = localStorage.getItem('lastRevealShown')

        if (lastShown !== today && !hasShownReveal) {
          try {
            const data = await trackingApi.getToday()
            if (data.songOfTheDay) {
              setRevealSong(data.songOfTheDay)
              setHasShownReveal(true)
              localStorage.setItem('lastRevealShown', today)
              
              // Show local notification as well
              showLocalNotification(
                'Your song of the day is ready!',
                `${data.songOfTheDay.song.name} by ${data.songOfTheDay.song.artist}`,
                data.songOfTheDay.song.albumArtUrl
              )
            }
          } catch (error) {
            console.error('[v0] Failed to check for reveal:', error)
          }
        }
      }
    }

    checkForReveal()
    // Check every minute
    const interval = setInterval(checkForReveal, 60000)

    return () => clearInterval(interval)
  }, [hasShownReveal])

  const showReveal = (song: SongOfTheDay) => {
    setRevealSong(song)
  }

  return (
    <RevealContext.Provider value={{ showReveal }}>
      {children}
      {revealSong && (
        <RevealScreen
          song={revealSong}
          onClose={() => setRevealSong(null)}
        />
      )}
    </RevealContext.Provider>
  )
}

export function useReveal() {
  const context = useContext(RevealContext)
  if (context === undefined) {
    throw new Error('useReveal must be used within a RevealProvider')
  }
  return context
}
