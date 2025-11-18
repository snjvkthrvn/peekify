"use client"

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CalendarGrid } from '@/components/calendar/calendar-grid'
import { DayDetailModal } from '@/components/calendar/day-detail-modal'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Skeleton } from '@/components/ui/loading-skeleton'
import { trackingApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import type { SongOfTheDay } from '@/types'
import { CalendarIcon, Music, Clock, UsersIcon } from 'lucide-react'

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['calendar-history'],
    queryFn: async () => {
      const response = await trackingApi.getHistory()
      const songsMap: Record<string, SongOfTheDay> = {}
      response.songs?.forEach((song: SongOfTheDay) => {
        songsMap[song.date] = song
      })
      return { songs: songsMap, raw: response.songs || [] }
    },
    enabled: !!user,
  })

  const songs = data?.songs || {}
  const songsArray = data?.raw || []

  const stats = {
    daysTracked: Object.keys(songs).length,
    totalPlays: songsArray.reduce((sum, s) => sum + s.playCount, 0),
    hoursListened: Math.round(
      songsArray.reduce((sum, s) => sum + s.totalListeningTimeMs, 0) / (1000 * 60 * 60)
    ),
    uniqueArtists: new Set(songsArray.map(s => s.song.artist)).size,
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleDayClick = (date: string) => {
    if (songs[date]) {
      setSelectedDate(date)
    }
  }

  if (authLoading) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 pb-20 md:pb-8" role="main">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 md:space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-balance">Your Music Calendar</h1>
            <p className="text-foreground-secondary text-balance">
              Browse your daily songs and relive musical memories
            </p>
          </header>

          {isLoading ? (
            <div className="space-y-6" role="status" aria-label="Loading calendar">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {[...Array(35)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <CalendarGrid 
                songs={songs} 
                onDayClick={handleDayClick}
                aria-label="Music calendar grid"
              />

              {stats.daysTracked > 0 && (
                <section 
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pt-6"
                  aria-label="Listening statistics"
                >
                  <div className="p-4 md:p-6 rounded-xl bg-background-secondary border border-border text-center transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <CalendarIcon className="h-5 w-5 text-accent-primary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-accent-primary">
                      {stats.daysTracked}
                    </div>
                    <div className="text-xs md:text-sm text-foreground-secondary mt-1">Days Tracked</div>
                  </div>
                  
                  <div className="p-4 md:p-6 rounded-xl bg-background-secondary border border-border text-center transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Music className="h-5 w-5 text-accent-secondary" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-accent-secondary">
                      {stats.totalPlays}
                    </div>
                    <div className="text-xs md:text-sm text-foreground-secondary mt-1">Total Plays</div>
                  </div>
                  
                  <div className="p-4 md:p-6 rounded-xl bg-background-secondary border border-border text-center transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <Clock className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-success">
                      {stats.hoursListened}
                    </div>
                    <div className="text-xs md:text-sm text-foreground-secondary mt-1">Hours Listened</div>
                  </div>
                  
                  <div className="p-4 md:p-6 rounded-xl bg-background-secondary border border-border text-center transition-transform hover:scale-105">
                    <div className="flex justify-center mb-2">
                      <UsersIcon className="h-5 w-5 text-warning" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-warning">
                      {stats.uniqueArtists}
                    </div>
                    <div className="text-xs md:text-sm text-foreground-secondary mt-1">Unique Artists</div>
                  </div>
                </section>
              )}

              {stats.daysTracked === 0 && (
                <div className="text-center py-12 md:py-20 space-y-4 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-accent-primary/10 flex items-center justify-center">
                      <CalendarIcon className="h-10 w-10 text-accent-primary" />
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-balance">No history yet</h2>
                  <p className="text-foreground-secondary max-w-md mx-auto text-balance">
                    Your music calendar will fill up as you listen to Spotify. Check back at 9:30pm for your first song of the day!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />

      <DayDetailModal
        song={selectedDate ? songs[selectedDate] : null}
        open={selectedDate !== null}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      />
    </div>
  )
}
