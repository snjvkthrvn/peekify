"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ProfilePicture } from '@/components/shared/profile-picture'
import { AlbumArt } from '@/components/shared/album-art'
import { ReactionRing } from '@/components/shared/reaction-ring'
import { ReactionButton } from '@/components/shared/reaction-button'
import { Button } from '@/components/ui/button'
import { MessageCircle, ListMusic, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/types'
import { reactionsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface PostCardProps {
  post: Post
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)

  const currentUserReaction = post.reactions.find((r) => r.userId === user?.id)

  const reactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      if (currentUserReaction) {
        if (currentUserReaction.emoji === emoji) {
          await reactionsApi.removeReaction(post.id)
        } else {
          await reactionsApi.addReaction(post.id, emoji)
        }
      } else {
        await reactionsApi.addReaction(post.id, emoji)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['post', post.id] })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      })
    },
  })

  const handleReaction = (emoji: string) => {
    reactionMutation.mutate(emoji)
  }

  const handleAddToQueue = async () => {
    try {
      // This would call the backend to add to Spotify queue
      toast({
        title: 'Added to queue',
        description: `${post.song.name} by ${post.song.artist}`,
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
          title: `${post.user.username}'s song of the day`,
          text: `${post.song.name} by ${post.song.artist}`,
          url: `${window.location.origin}/post/${post.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
        toast({
          title: 'Link copied',
          description: 'Post link copied to clipboard',
        })
      }
    } catch (error) {
      // User cancelled share
    }
  }

  return (
    <article 
      className="rounded-xl bg-background-secondary border border-border p-4 space-y-4 animate-fade-in transition-all hover:border-border-hover"
      aria-label={`${post.user.username}'s song of the day`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/profile/${post.user.username}`} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent-primary rounded-lg"
          aria-label={`View ${post.user.username}'s profile`}
        >
          <ProfilePicture
            src={post.user.profilePictureUrl}
            alt={post.user.username}
            size="md"
          />
          <div>
            <div className="font-semibold">{post.user.username}</div>
            <time 
              className="text-sm text-foreground-secondary"
              dateTime={post.createdAt}
            >
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </time>
          </div>
        </Link>
      </div>

      {/* Album Art with Reactions */}
      <div className="relative">
        <AlbumArt
          src={post.song.albumArtUrl}
          alt={`${post.song.name} by ${post.song.artist}`}
          size="hero"
          priority={priority}
        />
        <ReactionRing reactions={post.reactions} />
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-balance">{post.song.name}</h3>
        <p className="text-foreground-secondary">{post.song.artist}</p>
        <div className="flex items-center gap-4 text-sm text-foreground-tertiary">
          <span>{post.playCount} {post.playCount === 1 ? 'play' : 'plays'}</span>
          <span aria-hidden="true">•</span>
          <span>{Math.round(post.totalListeningTimeMs / 60000)} minutes</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border" role="group" aria-label="Post actions">
        <ReactionButton
          onReact={handleReaction}
          currentReaction={currentUserReaction?.emoji as any}
          disabled={reactionMutation.isPending}
        />
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setShowComments(!showComments)}
          aria-label={`View ${post.commentCount} comments`}
          aria-expanded={showComments}
        >
          <MessageCircle className="h-4 w-4" />
          {post.commentCount > 0 && post.commentCount}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={handleAddToQueue}
          aria-label="Add to Spotify queue"
        >
          <ListMusic className="h-4 w-4" />
          <span className="hidden sm:inline">Queue</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 ml-auto" 
          onClick={handleShare}
          aria-label="Share post"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-4 border-t border-border space-y-4" role="region" aria-label="Comments">
          <div className="text-sm text-foreground-secondary">Comments coming soon...</div>
        </div>
      )}
    </article>
  )
}
