"use client"

import { useState } from 'react'
import { ProfilePicture } from './profile-picture'
import type { Reaction } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ReactionRingProps {
  reactions: Reaction[]
  className?: string
}

export function ReactionRing({ reactions, className }: ReactionRingProps) {
  const visibleReactions = reactions.slice(0, 12)
  const remainingCount = reactions.length - visibleReactions.length

  if (reactions.length === 0) return null

  const radius = 45 // percentage from center
  const angleStep = 360 / Math.min(visibleReactions.length, 12)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={cn('absolute inset-0 cursor-pointer', className)}>
          {visibleReactions.map((reaction, index) => {
            const angle = (angleStep * index * Math.PI) / 180
            const x = 50 + radius * Math.cos(angle)
            const y = 50 + radius * Math.sin(angle)

            return (
              <div
                key={reaction.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div className="relative">
                  <ProfilePicture
                    src={reaction.user.profilePictureUrl}
                    alt={reaction.user.username}
                    size="sm"
                  />
                  <div className="absolute -bottom-1 -right-1 text-xs bg-background rounded-full h-5 w-5 flex items-center justify-center border border-background">
                    {reaction.emoji}
                  </div>
                </div>
              </div>
            )
          })}
          {remainingCount > 0 && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background-secondary border-2 border-background flex items-center justify-center text-xs font-semibold"
              style={{ left: '50%', top: '10%' }}
            >
              +{remainingCount}
            </div>
          )}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactions ({reactions.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {reactions.map((reaction) => (
            <div key={reaction.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-secondary transition-colors">
              <ProfilePicture
                src={reaction.user.profilePictureUrl}
                alt={reaction.user.username}
                size="sm"
              />
              <div className="flex-1">
                <div className="font-medium">{reaction.user.username}</div>
              </div>
              <div className="text-2xl">{reaction.emoji}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
