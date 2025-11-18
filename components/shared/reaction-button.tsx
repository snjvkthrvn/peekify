"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const emojis = ['🔥', '❤️', '💀', '😭', '🎯', '👀', '🤔', '😍'] as const

interface ReactionButtonProps {
  onReact: (emoji: typeof emojis[number]) => void
  currentReaction?: typeof emojis[number]
}

export function ReactionButton({ onReact, currentReaction }: ReactionButtonProps) {
  const [open, setOpen] = useState(false)

  const handleReaction = (emoji: typeof emojis[number]) => {
    onReact(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {currentReaction || <Smile className="h-4 w-4" />}
          React
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-4 gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`h-12 w-12 rounded-lg hover:bg-background-tertiary transition-colors text-2xl flex items-center justify-center ${
                currentReaction === emoji ? 'bg-background-tertiary ring-2 ring-accent-primary' : ''
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
