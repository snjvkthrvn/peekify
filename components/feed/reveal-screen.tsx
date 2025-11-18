"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlbumArt } from '@/components/shared/album-art'
import { Button } from '@/components/ui/button'
import { Share2, ListMusic, X } from 'lucide-react'
import type { SongOfTheDay } from '@/types'
import { useToast } from '@/hooks/use-toast'
import Confetti from 'react-confetti'

interface RevealScreenProps {
  song: SongOfTheDay
  onClose: () => void
}

export function RevealScreen({ song, onClose }: RevealScreenProps) {
  const { toast } = useToast()
  const [showConfetti, setShowConfetti] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Song of the Day',
          text: `${song.song.name} by ${song.song.artist}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link copied',
          description: 'Share your song with friends',
        })
      }
    } catch (error) {
      // User cancelled share
    }
  }

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

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="max-w-lg w-full space-y-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-medium text-accent-primary"
              >
                Your Song of the Day
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold"
              >
                {new Date(song.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex justify-center"
            >
              <AlbumArt
                src={song.song.albumArtUrl}
                alt={`${song.song.name} by ${song.song.artist}`}
                size="xl"
                className="shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold">{song.song.name}</h2>
              <p className="text-lg text-foreground-secondary">{song.song.artist}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="p-4 rounded-lg bg-background-secondary">
                <div className="text-3xl font-bold text-accent-primary">
                  {song.playCount}
                </div>
                <div className="text-sm text-foreground-secondary">Plays Today</div>
              </div>
              <div className="p-4 rounded-lg bg-background-secondary">
                <div className="text-3xl font-bold text-accent-primary">
                  {Math.round(song.totalListeningTimeMs / 60000)}
                </div>
                <div className="text-sm text-foreground-secondary">Minutes</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-3"
            >
              <Button onClick={handleShare} variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleAddToQueue} variant="outline" className="flex-1">
                <ListMusic className="h-4 w-4 mr-2" />
                Add to Queue
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button onClick={onClose} className="w-full">
                Go to Feed
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
