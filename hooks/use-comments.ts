"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Types
export interface Comment {
  id: string
  feedItemId: string
  userId: string
  content: string
  createdAt: string
  user: {
    id: string
    displayName: string
    profilePictureUrl?: string
  }
  likeCount: number
  isLiked: boolean
}

interface CommentsResponse {
  success: boolean
  comments: Comment[]
}

interface CreateCommentResponse {
  success: boolean
  comment: Comment
}

interface ToggleLikeResponse {
  success: boolean
  likeCount: number
  isLiked: boolean
}

// Query Keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (feedItemId: string) => [...commentKeys.lists(), feedItemId] as const,
  likes: (commentId: string) => [...commentKeys.all, 'likes', commentId] as const,
}

/**
 * Hook to fetch comments for a feed item
 */
export function useComments(feedItemId: string) {
  return useQuery<CommentsResponse>({
    queryKey: commentKeys.list(feedItemId),
    queryFn: () => commentsApi.getComments(feedItemId),
    enabled: !!feedItemId,
  })
}

/**
 * Hook to create a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<CreateCommentResponse, Error, { feedItemId: string; content: string }>({
    mutationFn: ({ feedItemId, content }) => commentsApi.addComment(feedItemId, content),
    onSuccess: (data, variables) => {
      // Invalidate and refetch comments for this feed item
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.feedItemId) })

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to post comment",
        description: error.message || "Something went wrong. Please try again.",
      })
    },
  })
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, Error, { commentId: string; feedItemId: string }>({
    mutationFn: ({ commentId }) => commentsApi.deleteComment(commentId),
    onMutate: async ({ commentId, feedItemId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.list(feedItemId) })

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<CommentsResponse>(
        commentKeys.list(feedItemId)
      )

      // Optimistically remove comment
      queryClient.setQueryData<CommentsResponse>(
        commentKeys.list(feedItemId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            comments: old.comments.filter((c) => c.id !== commentId),
          }
        }
      )

      return { previousComments }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(variables.feedItemId),
          context.previousComments
        )
      }

      toast({
        variant: "destructive",
        title: "Failed to delete comment",
        description: error.message || "Something went wrong. Please try again.",
      })
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      })
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.feedItemId) })
    },
  })
}

/**
 * Hook to toggle like on a comment
 */
export function useToggleCommentLike() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<ToggleLikeResponse, Error, { commentId: string; feedItemId: string }>({
    mutationFn: ({ commentId }) => commentsApi.toggleLike(commentId),
    onMutate: async ({ commentId, feedItemId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.list(feedItemId) })

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<CommentsResponse>(
        commentKeys.list(feedItemId)
      )

      // Optimistically update like state
      queryClient.setQueryData<CommentsResponse>(
        commentKeys.list(feedItemId),
        (old) => {
          if (!old) return old
          return {
            ...old,
            comments: old.comments.map((comment) => {
              if (comment.id === commentId) {
                const isCurrentlyLiked = comment.isLiked
                return {
                  ...comment,
                  isLiked: !isCurrentlyLiked,
                  likeCount: isCurrentlyLiked
                    ? comment.likeCount - 1
                    : comment.likeCount + 1,
                }
              }
              return comment
            }),
          }
        }
      )

      return { previousComments }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(variables.feedItemId),
          context.previousComments
        )
      }

      toast({
        variant: "destructive",
        title: "Failed to update like",
        description: error.message || "Something went wrong. Please try again.",
      })
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.feedItemId) })
    },
  })
}

/**
 * Hook to get likes for a comment
 */
export function useCommentLikes(commentId: string) {
  return useQuery({
    queryKey: commentKeys.likes(commentId),
    queryFn: () => commentsApi.getLikes(commentId),
    enabled: !!commentId,
  })
}
