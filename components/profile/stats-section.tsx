"use client"

import { AlbumArt } from '@/components/shared/album-art'
import type { UserStats } from '@/types'

interface StatsSectionProps {
  stats: UserStats
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Top Tracks */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Top Tracks</h2>
        <div className="grid gap-4">
          {stats.topTracks.map((item, index) => (
            <div
              key={item.song.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary border border-border hover:border-border-hover transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl font-bold text-foreground-tertiary w-6">
                  {index + 1}
                </span>
                <AlbumArt
                  src={item.song.albumArtUrl}
                  alt={item.song.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.song.name}</div>
                  <div className="text-sm text-foreground-secondary truncate">
                    {item.song.artist}
                  </div>
                </div>
              </div>
              <div className="text-sm text-foreground-tertiary">
                {item.playCount} plays
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Top Artists</h2>
        <div className="grid grid-cols-3 gap-4">
          {stats.topArtists.map((artist) => (
            <div
              key={artist.name}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background-secondary border border-border text-center"
            >
              <div className="h-20 w-20 rounded-full overflow-hidden bg-background-tertiary">
                {artist.imageUrl && (
                  <img
                    src={artist.imageUrl || "/placeholder.svg"}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="w-full">
                <div className="font-semibold text-sm truncate">{artist.name}</div>
                <div className="text-xs text-foreground-tertiary">
                  {artist.playCount} plays
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Genres */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Top Genres</h2>
        <div className="flex flex-wrap gap-2">
          {stats.topGenres.map((genre, index) => {
            const colors = [
              'bg-accent-primary/20 text-accent-primary',
              'bg-accent-secondary/20 text-accent-secondary',
              'bg-success/20 text-success',
            ]
            return (
              <div
                key={genre.name}
                className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  colors[index % colors.length]
                }`}
              >
                {genre.name}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
