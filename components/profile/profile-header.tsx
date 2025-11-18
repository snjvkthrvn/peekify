"use client"

import { ProfilePicture } from '@/components/shared/profile-picture'
import { Button } from '@/components/ui/button'
import { Settings, UserPlus, UserCheck, UserMinus } from 'lucide-react'
import type { User } from '@/types'
import Link from 'next/link'

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
  isFriend?: boolean
  isPending?: boolean
  onAddFriend?: () => void
  onRemoveFriend?: () => void
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFriend,
  isPending,
  onAddFriend,
  onRemoveFriend,
}: ProfileHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="flex flex-col items-center gap-4 text-center">
        <ProfilePicture
          src={user.profilePictureUrl}
          alt={user.username}
          size="xl"
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">@{user.username}</h1>
          {user.bio && (
            <p className="text-foreground-secondary max-w-md">{user.bio}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <Button asChild variant="outline">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          ) : isFriend ? (
            <Button variant="outline" onClick={onRemoveFriend}>
              <UserMinus className="h-4 w-4 mr-2" />
              Unfriend
            </Button>
          ) : isPending ? (
            <Button variant="outline" disabled>
              <UserCheck className="h-4 w-4 mr-2" />
              Request Sent
            </Button>
          ) : (
            <Button onClick={onAddFriend}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          )}
        </div>
      </div>

      {/* Privacy Badge */}
      {user.privacyLevel !== 'public' && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background-secondary text-sm">
            <div className="h-2 w-2 rounded-full bg-accent-primary" />
            <span className="capitalize">{user.privacyLevel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
