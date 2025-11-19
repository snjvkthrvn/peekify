"use client"

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ReactionEmoji = '🔥' | '❤️' | '💀' | '😭' | '🎯' | '👀' | '🤔' | '😍'

const REACTION_EMOJIS: ReactionEmoji[] = ['🔥', '❤️', '💀', '😭', '🎯', '👀', '🤔', '😍']

interface ReactionPickerProps {
  onSelect: (emoji: ReactionEmoji) => void
  currentReaction?: ReactionEmoji
  trigger: React.ReactNode
}

export function ReactionPicker({ onSelect, currentReaction, trigger }: ReactionPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: ReactionEmoji) => {
    onSelect(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-3 bg-bg-elevated backdrop-blur-lg border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        align="start"
        sideOffset={8}
      >
        <div className="grid grid-cols-4 gap-2">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "text-2xl transition-all duration-200",
                "hover:bg-bg-highlight hover:scale-110",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-green",
                "active:scale-95",
                currentReaction === emoji && "bg-bg-highlight border-2 border-accent-green"
              )}
              aria-label={`React with ${emoji}`}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
