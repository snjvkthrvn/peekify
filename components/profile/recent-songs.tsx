"use client"

import { AlbumArt } from '@/components/shared/album-art'
import type { SongOfTheDay } from '@/types'

interface RecentSongsProps {
  songs: SongOfTheDay[]
}

export function RecentSongs({ songs }: RecentSongsProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-secondary">
        No recent songs
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Last 7 Days</h2>
      <div className="grid grid-cols-7 gap-2">
        {songs.map((songOfDay) => (
          <button
            key={songOfDay.id}
            className="group relative aspect-square rounded-lg overflow-hidden transition-transform hover:scale-105"
          >
            <AlbumArt
              src={songOfDay.song.albumArtUrl}
              alt={songOfDay.song.name}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
              <div className="text-xs font-semibold line-clamp-2">
                {songOfDay.song.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
