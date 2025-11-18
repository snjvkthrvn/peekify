"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/profile-header'
import { StatsSection } from '@/components/profile/stats-section'
import { RecentSongs } from '@/components/profile/recent-songs'
import { ProfileSkeleton } from '@/components/ui/loading-skeleton'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { userApi, statsApi, friendsApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { Lock } from 'lucide-react'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const username = params.username as string

  const isOwnProfile = currentUser?.username === username

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const userData = await userApi.getByUsername(username)
      const statsData = isOwnProfile ? await statsApi.getMyStats() : null
      return {
        user: userData.user,
        stats: statsData,
        recentSongs: userData.recentSongs || [],
        isFriend: userData.isFriend || false,
        isPending: userData.isPending || false,
      }
    },
    enabled: !!username && !!currentUser,
  })

  const addFriendMutation = useMutation({
    mutationFn: (userId: string) => friendsApi.sendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
      toast({
        title: 'Friend request sent',
        description: `Request sent to @${username}`,
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive',
      })
    },
  })

  const removeFriendMutation = useMutation({
    mutationFn: (userId: string) => friendsApi.removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
      toast({
        title: 'Friend removed',
        description: `Removed @${username} from friends`,
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove friend',
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/auth/login')
    }
  }, [currentUser, authLoading, router])

  if (authLoading || !currentUser) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 pb-20 md:pb-8" role="main">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          {isLoading ? (
            <ProfileSkeleton />
          ) : profileData?.user ? (
            <>
              <ProfileHeader
                user={profileData.user}
                isOwnProfile={isOwnProfile}
                isFriend={profileData.isFriend}
                isPending={profileData.isPending}
                onAddFriend={() => addFriendMutation.mutate(profileData.user.id)}
                onRemoveFriend={() => removeFriendMutation.mutate(profileData.user.id)}
              />

              {(isOwnProfile || profileData.isFriend || profileData.user.privacyLevel === 'public') ? (
                <>
                  <RecentSongs songs={profileData.recentSongs} />
                  {profileData.stats && <StatsSection stats={profileData.stats} />}
                </>
              ) : (
                <div className="text-center py-12 md:py-20 space-y-4 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center">
                      <Lock className="h-10 w-10 text-warning" />
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-balance">This Profile is Private</h2>
                  <p className="text-foreground-secondary max-w-md mx-auto text-balance">
                    Add @{profileData.user.username} as a friend to see their music
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 md:py-20 space-y-4 animate-fade-in">
              <div className="text-6xl">👤</div>
              <h2 className="text-xl md:text-2xl font-semibold">User Not Found</h2>
              <p className="text-foreground-secondary">
                This user doesn't exist or has been deleted
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
