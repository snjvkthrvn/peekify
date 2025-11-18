"use client"

import { trackingApi } from './api'

interface SpotifyTrack {
  name: string
  artist: string
  album: string
  spotifyId: string
  albumArtUrl: string
  timestamp: number
  durationMs: number
}

class SpotifyTracker {
  private tracks: SpotifyTrack[] = []
  private pollInterval: NodeJS.Timeout | null = null
  private lastTrackId: string | null = null
  private trackStartTime: number = 0

  start() {
    if (this.pollInterval) return

    // Check visibility to adjust polling rate
    const poll = () => {
      const isVisible = document.visibilityState === 'visible'
      const interval = isVisible ? 2 * 60 * 1000 : 15 * 60 * 1000 // 2 min visible, 15 min hidden

      if (this.pollInterval) {
        clearInterval(this.pollInterval)
      }

      this.pollInterval = setInterval(() => this.checkCurrentTrack(), interval)
      this.checkCurrentTrack()
    }

    poll()
    document.addEventListener('visibilitychange', poll)
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  private async checkCurrentTrack() {
    try {
      // This would call Spotify API through our backend
      // For now, we'll just simulate with localStorage
      const currentTrack = this.getCurrentlyPlaying()
      
      if (!currentTrack) return

      const now = Date.now()
      
      // If it's a different track
      if (currentTrack.spotifyId !== this.lastTrackId) {
        // Save previous track if listened for >30 seconds
        if (this.lastTrackId && (now - this.trackStartTime) > 30000) {
          this.tracks.push({
            ...currentTrack,
            timestamp: this.trackStartTime,
          })
        }
        
        this.lastTrackId = currentTrack.spotifyId
        this.trackStartTime = now
      }

      // Sync to backend every 5 tracks
      if (this.tracks.length >= 5) {
        await this.syncToBackend()
      }
    } catch (error) {
      console.error('[v0] Failed to track:', error)
    }
  }

  private getCurrentlyPlaying(): SpotifyTrack | null {
    // This is a placeholder - actual implementation would fetch from Spotify
    // through the backend
    return null
  }

  private async syncToBackend() {
    if (this.tracks.length === 0) return

    try {
      await trackingApi.sync({ tracks: this.tracks })
      this.tracks = []
    } catch (error) {
      console.error('[v0] Failed to sync tracks:', error)
    }
  }

  async forceSync() {
    await this.syncToBackend()
  }
}

export const spotifyTracker = new SpotifyTracker()
