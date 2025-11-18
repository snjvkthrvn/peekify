"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

export type WebSocketMessage = {
  type: 'feed:new_post' | 'reaction:added' | 'comment:added' | 'friend:request' | 'friend:accepted' | 'notification'
  payload: any
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('[v0] WebSocket message received:', message.type)

    switch (message.type) {
      case 'feed:new_post':
        // Invalidate feed queries to refetch with new post
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        toast({
          title: 'New Post',
          description: `${message.payload.user?.username || 'Someone'} just posted their song!`,
        })
        break

      case 'reaction:added':
        // Invalidate specific post reactions
        queryClient.invalidateQueries({ queryKey: ['post', message.payload.postId] })
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        break

      case 'comment:added':
        // Invalidate post comments
        queryClient.invalidateQueries({ queryKey: ['comments', message.payload.postId] })
        queryClient.invalidateQueries({ queryKey: ['feed'] })
        break

      case 'friend:request':
        // Invalidate friend requests
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
        toast({
          title: 'Friend Request',
          description: `${message.payload.from?.username || 'Someone'} sent you a friend request`,
        })
        break

      case 'friend:accepted':
        // Invalidate friends list
        queryClient.invalidateQueries({ queryKey: ['friends'] })
        toast({
          title: 'Friend Request Accepted',
          description: `${message.payload.user?.username || 'Someone'} accepted your friend request!`,
        })
        break

      case 'notification':
        // Show generic notification
        toast({
          title: message.payload.title || 'Notification',
          description: message.payload.body,
        })
        break
    }
  }, [queryClient, toast])

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(WS_URL)

      ws.current.onopen = () => {
        console.log('[v0] WebSocket connected')
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('[v0] Failed to parse WebSocket message:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('[v0] WebSocket error:', error)
      }

      ws.current.onclose = () => {
        console.log('[v0] WebSocket disconnected, reconnecting in 5s...')
        reconnectTimeout.current = setTimeout(connect, 5000)
      }
    } catch (error) {
      console.error('[v0] Failed to connect WebSocket:', error)
      reconnectTimeout.current = setTimeout(connect, 5000)
    }
  }, [handleMessage])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('[v0] WebSocket not connected, cannot send message')
    }
  }, [])

  const isConnected = ws.current?.readyState === WebSocket.OPEN

  return { sendMessage, isConnected }
}
