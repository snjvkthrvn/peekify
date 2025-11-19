"use client"

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ProfilePicture } from '@/components/shared/profile-picture'
import { Button } from '@/components/ui/button'
import { Heart, MoreVertical, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Comment {
  id: string
  userId: string
  username: string
  profilePic?: string
  text: string
  timestamp: string
  likeCount: number
  isLiked: boolean
}

interface CommentListProps {
  postId: string
  comments: Comment[]
  onLike: (commentId: string) => void
  onDelete: (commentId: string) => void
  className?: string
}

export function CommentList({ postId, comments, onLike, onDelete, className }: CommentListProps) {
  const { user } = useAuth()
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteCommentId) {
      onDelete(deleteCommentId)
      setDeleteCommentId(null)
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-tertiary text-sm">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {comments.map((comment) => {
          const isOwnComment = user?.id === comment.userId

          return (
            <div key={comment.id} className="flex items-start gap-3 group">
              <Link
                href={`/profile/${comment.username}`}
                className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-green rounded-full"
              >
                <ProfilePicture
                  src={comment.profilePic}
                  username={comment.username}
                  size="sm"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${comment.username}`}
                      className="font-semibold text-sm hover:underline focus:outline-none focus-visible:underline"
                    >
                      {comment.username}
                    </Link>
                    <p className="text-sm mt-0.5 break-words whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>

                  {isOwnComment && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          aria-label="Comment options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setDeleteCommentId(comment.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete comment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => onLike(comment.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs transition-colors",
                      "hover:text-accent-green focus:outline-none focus-visible:text-accent-green",
                      comment.isLiked ? "text-accent-green font-medium" : "text-text-tertiary"
                    )}
                    aria-label={comment.isLiked ? "Unlike comment" : "Like comment"}
                  >
                    <Heart
                      className={cn(
                        "w-3.5 h-3.5 transition-all",
                        comment.isLiked && "fill-current"
                      )}
                    />
                    {comment.likeCount > 0 && (
                      <span>{comment.likeCount}</span>
                    )}
                  </button>

                  <time
                    className="text-xs text-text-tertiary"
                    dateTime={comment.timestamp}
                  >
                    {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                  </time>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={deleteCommentId !== null} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
