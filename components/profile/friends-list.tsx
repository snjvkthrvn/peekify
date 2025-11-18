"use client"

import { useState, useEffect } from 'react'
import { ProfilePicture } from '@/components/shared/profile-picture'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserPlus } from 'lucide-react'
import { friendsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import type { User } from '@/types'

export function FriendsList() {
  const { toast } = useToast()
  const [friends, setFriends] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadFriends()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadFriends = async () => {
    try {
      const data = await friendsApi.getFriends()
      setFriends(data.friends || [])
    } catch (error) {
      console.error('[v0] Failed to load friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    try {
      setSearching(true)
      const data = await friendsApi.searchUsers(searchQuery)
      setSearchResults(data.users || [])
    } catch (error) {
      console.error('[v0] Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddFriend = async (userId: string) => {
    try {
      await friendsApi.sendRequest(userId)
      toast({
        title: 'Friend request sent',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-foreground-secondary">Search Results</h3>
          {searching ? (
            <div className="text-sm text-foreground-tertiary">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-sm text-foreground-tertiary">No users found</div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors"
                >
                  <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1">
                    <ProfilePicture src={user.profilePictureUrl} alt={user.username} size="sm" />
                    <div>
                      <div className="font-semibold">@{user.username}</div>
                      {user.bio && (
                        <div className="text-sm text-foreground-secondary line-clamp-1">
                          {user.bio}
                        </div>
                      )}
                    </div>
                  </Link>
                  <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-foreground-secondary">
          Friends ({friends.length})
        </h3>
        {loading ? (
          <div className="text-sm text-foreground-tertiary">Loading...</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">👥</div>
            <p className="text-foreground-secondary">No friends yet</p>
            <p className="text-sm text-foreground-tertiary">
              Search for users above to add friends
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.username}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors"
              >
                <ProfilePicture src={friend.profilePictureUrl} alt={friend.username} size="sm" />
                <div className="flex-1">
                  <div className="font-semibold">@{friend.username}</div>
                  {friend.bio && (
                    <div className="text-sm text-foreground-secondary line-clamp-1">
                      {friend.bio}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
