"use client"

import { AlbumArt } from '@/components/shared/album-art'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ListMusic, Share2, ExternalLink } from 'lucide-react'
import type { SongOfTheDay } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface DayDetailModalProps {
  song: SongOfTheDay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DayDetailModal({ song, open, onOpenChange }: DayDetailModalProps) {
  const { toast } = useToast()

  if (!song) return null

  const handleAddToQueue = async () => {
    try {
      toast({
        title: 'Added to queue',
        description: `${song.song.name} by ${song.song.artist}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to queue',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My song of the day - ${new Date(song.date).toLocaleDateString()}`,
          text: `${song.song.name} by ${song.song.artist}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link copied',
          description: 'Link copied to clipboard',
        })
      }
    } catch (error) {
      // User cancelled share
    }
  }

  const openInSpotify = () => {
    window.open(`https://open.spotify.com/track/${song.song.spotifyId}`, '_blank')
  }

  const formattedDate = new Date(song.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{formattedDate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Album Art */}
          <div className="flex justify-center">
            <AlbumArt
              src={song.song.albumArtUrl}
              alt={`${song.song.name} by ${song.song.artist}`}
              size="lg"
            />
          </div>

          {/* Song Info */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">{song.song.name}</h3>
            <p className="text-lg text-foreground-secondary">{song.song.artist}</p>
            <p className="text-sm text-foreground-tertiary">{song.song.album}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-background-secondary">
              <div className="text-2xl font-bold text-accent-primary">{song.playCount}</div>
              <div className="text-sm text-foreground-secondary">Plays</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background-secondary">
              <div className="text-2xl font-bold text-accent-primary">
                {Math.round(song.totalListeningTimeMs / 60000)}
              </div>
              <div className="text-sm text-foreground-secondary">Minutes</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={handleAddToQueue}>
              <ListMusic className="h-4 w-4 mr-2" />
              Add to Queue
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={openInSpotify}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
