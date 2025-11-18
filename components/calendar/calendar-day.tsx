"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { SongOfTheDay } from '@/types'

interface CalendarDayProps {
  date: string
  day: number
  song?: SongOfTheDay
  isFuture: boolean
  isToday: boolean
  onClick: () => void
}

export function CalendarDay({ date, day, song, isFuture, isToday, onClick }: CalendarDayProps) {
  if (isFuture) {
    return (
      <div className="aspect-square rounded-lg bg-background-secondary border border-border opacity-50 flex items-center justify-center">
        <span className="text-sm text-foreground-tertiary">{day}</span>
      </div>
    )
  }

  if (!song) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'aspect-square rounded-lg border transition-colors flex items-center justify-center',
          isToday
            ? 'border-accent-primary bg-accent-primary/5'
            : 'border-border bg-background-secondary hover:border-border-hover'
        )}
      >
        <span className="text-sm">{day}</span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'aspect-square rounded-lg overflow-hidden relative group transition-all hover:scale-105',
        isToday && 'ring-2 ring-accent-primary'
      )}
    >
      <Image
        src={song.song.albumArtUrl || '/placeholder.svg?height=100&width=100'}
        alt={song.song.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <span className="text-xs font-medium line-clamp-2">{song.song.name}</span>
      </div>
      <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs font-semibold">
        {day}
      </div>
    </button>
  )
}
