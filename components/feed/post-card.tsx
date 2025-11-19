"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ProfilePicture } from '@/components/shared/profile-picture'
import { AlbumArt } from '@/components/shared/album-art'
import { ReactionRing } from '@/components/shared/reaction-ring'
import { ReactionPicker, type ReactionEmoji } from '@/components/shared/reaction-picker'
import { Button } from '@/components/ui/button'
import { MessageCircle, Plus, Share2, Heart, MoreVertical, Play, Clock, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/types'
import { reactionsApi } from '@/lib/api'
import { spotifyApi } from '@/lib/spotify-api'
import { SpotifyLink } from '@/components/shared/spotify-link'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { CommentInput } from './comment-input'
import { CommentList } from './comment-list'
import { useComments, useCreateComment, useDeleteComment, useToggleCommentLike } from '@/hooks/use-comments'

interface PostCardProps {
  post: Post
  priority?: boolean
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Fetch comments from backend using React Query
  const { data: commentsData, isLoading: commentsLoading } = useComments(post.id)
  const createCommentMutation = useCreateComment()
  const deleteCommentMutation = useDeleteComment()
  const toggleLikeMutation = useToggleCommentLike()

  // Map backend comment format to component format
  const comments = (commentsData?.comments || []).map((comment) => ({
    id: comment.id,
    userId: comment.userId,
    username: comment.user.displayName,
    profilePic: comment.user.profilePictureUrl,
    text: comment.content,
    timestamp: comment.createdAt,
    likeCount: comment.likeCount,
    isLiked: comment.isLiked,
  }))

  const currentUserReaction = post.reactions.find((r) => r.userId === user?.id)

  const reactionMutation = useMutation({
    mutationFn: async (emoji: ReactionEmoji) => {
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

  const handleReaction = (emoji: ReactionEmoji) => {
    reactionMutation.mutate(emoji)
  }

  const handleAddToQueue = async () => {
    try {
      // In a real app, we would use the actual Spotify URI from the song object
      // For now we'll simulate it or use a placeholder if not available
      const trackUri = post.song.spotifyId ? `spotify:track:${post.song.spotifyId}` : 'spotify:track:placeholder'
      
      await spotifyApi.addToQueue(trackUri)
      
      toast({
        title: 'Added to queue',
        description: `${post.song.name} by ${post.song.artist}`,
        className: "border-accent-green/50 bg-accent-green/10",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to queue'
      
      if (message === 'No active device found') {
        toast({
          title: 'No active Spotify device',
          description: 'Open Spotify on a device to add to queue',
          variant: 'destructive',
        })
      } else if (message === 'Premium required') {
        toast({
          title: 'Spotify Premium required',
          description: 'You need Spotify Premium to use this feature',
          variant: 'destructive',
        })
      } else {
        // Fallback for demo purposes since we don't have a real token
        toast({
          title: 'Added to queue (Demo)',
          description: `${post.song.name} by ${post.song.artist}`,
        })
      }
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

  const handleAddComment = async (text: string) => {
    await createCommentMutation.mutateAsync({
      feedItemId: post.id,
      content: text,
    })
  }

  const handleLikeComment = (commentId: string) => {
    toggleLikeMutation.mutate({
      commentId,
      feedItemId: post.id,
    })
  }

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({
      commentId,
      feedItemId: post.id,
    })
  }

  return (
    <article 
      className={cn(
        "w-full max-w-[640px] mx-auto",
        "bg-bg-elevated rounded-[28px] overflow-hidden",
        "shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
        "transition-all duration-300",
        "hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] hover:-translate-y-1",
        "animate-fade-in"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${post.user.username}'s song of the day`}
    >
      <div className="flex items-center justify-between p-4 bg-bg-surface">
        <Link 
          href={`/profile/${post.user.username}`} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-green/50 rounded-lg"
          aria-label={`View ${post.user.username}'s profile`}
        >
          <ProfilePicture
            src={post.user.profilePictureUrl}
            username={post.user.username}
            size="md"
          />
          <div>
            <div className="font-semibold text-base">{post.user.username}</div>
            <time 
              className="text-sm text-text-tertiary"
              dateTime={post.createdAt}
            >
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </time>
          </div>
        </Link>
        
        <Button variant="icon" size="icon-sm" aria-label="More options">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative aspect-square w-full group">
        <AlbumArt
          src={post.song.albumArtUrl}
          alt={`${post.song.name} by ${post.song.artist}`}
          size="hero"
          priority={priority}
          showPlayOverlay={true}
        />
        <ReactionRing reactions={post.reactions} className="pointer-events-none" />
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
            <span className="text-white font-semibold text-lg">View Details</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-gradient-to-b from-accent-green/20 to-transparent">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h3 className="text-lg font-semibold text-balance leading-tight">{post.song.name}</h3>
          <SpotifyLink 
            uri={`spotify:track:${post.song.spotifyId}`} 
            type="track"
            className="shrink-0 mt-1"
          >
            <span className="sr-only">Open in Spotify</span>
          </SpotifyLink>
        </div>
        <p className="text-text-secondary text-base mb-3">{post.song.artist}</p>
        
        <div className="flex items-center gap-3 text-sm text-text-tertiary">
          <div className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" />
            <span>{post.playCount}</span>
          </div>
          <span aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.round(post.totalListeningTimeMs / 60000)}m</span>
          </div>
          <span aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDistanceToNow(new Date(post.createdAt))}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 bg-bg-surface border-t border-white/5" role="group" aria-label="Post actions">
        <ReactionPicker
          onSelect={handleReaction}
          currentReaction={currentUserReaction?.emoji as ReactionEmoji}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 h-10 rounded-full",
                currentUserReaction && "text-accent-green"
              )}
              disabled={reactionMutation.isPending}
              aria-label="React to post"
            >
              <Heart className={cn("w-5 h-5", currentUserReaction && "fill-accent-green")} />
              <span className="text-sm font-medium">
                {currentUserReaction ? 'Reacted' : 'React'}
              </span>
            </Button>
          }
        />
        
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 h-10 rounded-full",
            showComments && "bg-bg-elevated text-accent-green"
          )}
          onClick={() => setShowComments(!showComments)}
          aria-label={`View ${post.commentCount} comments`}
          aria-expanded={showComments}
        >
          <MessageCircle className={cn("w-5 h-5", showComments && "fill-current")} />
          <span className="text-sm font-medium">
            {comments.length > 0 ? comments.length : (post.commentCount > 0 ? post.commentCount : 'Comment')}
          </span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 h-10 rounded-full" 
          onClick={handleAddToQueue}
          aria-label="Add to Spotify queue"
        >
          <Plus className="w-5 h-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 h-10 rounded-full ml-auto" 
          onClick={handleShare}
          aria-label="Share post"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-bg-surface animate-in slide-in-from-top-2 duration-300">
          <div className="px-4 py-4 space-y-6">
            <CommentList 
              postId={post.id}
              comments={comments}
              onLike={handleLikeComment}
              onDelete={handleDeleteComment}
            />
            <div className="sticky bottom-0 bg-bg-surface pt-2 pb-1">
              <CommentInput 
                postId={post.id}
                onSubmit={handleAddComment}
                autoFocus={comments.length === 0}
              />
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
