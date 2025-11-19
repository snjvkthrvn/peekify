"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ProfilePicture } from '@/components/shared/profile-picture'
import { cn } from '@/lib/utils'

interface CommentInputProps {
  postId: string
  onSubmit: (text: string) => Promise<void>
  autoFocus?: boolean
  className?: string
}

export function CommentInput({ postId, onSubmit, autoFocus = false, className }: CommentInputProps) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedText = text.trim()
    if (!trimmedText || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(trimmedText)
      setText('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)

    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto'
    // Set height to scrollHeight to expand as needed (max 120px)
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-start gap-3", className)}>
      <ProfilePicture
        src={user.profilePictureUrl}
        username={user.displayName || user.email}
        size="sm"
        className="mt-1 shrink-0"
      />

      <div className="flex-1 flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className={cn(
            "min-h-[40px] max-h-[120px] resize-none",
            "bg-bg-elevated border-white/10",
            "focus-visible:ring-accent-green/50",
            "placeholder:text-text-tertiary",
            "text-sm"
          )}
          disabled={isSubmitting}
          aria-label="Comment text"
          rows={1}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || isSubmitting}
          className={cn(
            "shrink-0 h-10 w-10 rounded-full",
            "bg-accent-green hover:bg-accent-green/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
          aria-label="Submit comment"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}
