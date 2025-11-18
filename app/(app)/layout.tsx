"use client"

import { useSpotifyTracker } from '@/hooks/use-spotify-tracker'
import { useWebSocket } from '@/lib/websocket'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Start Spotify tracking for all authenticated pages
  useSpotifyTracker()
  
  useWebSocket()

  return <>{children}</>
}
