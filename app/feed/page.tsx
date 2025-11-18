"use client"

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { PostCard } from '@/components/feed/post-card'
import { PostSkeleton } from '@/components/ui/loading-skeleton'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { InstallPWAPrompt } from '@/components/shared/install-pwa-prompt'
import { Button } from '@/components/ui/button'
import { RefreshCw, Users } from 'lucide-react'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import type { Post } from '@/types'
import { useEffect, useRef } from 'react'

export default function FeedPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const observerTarget = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => feedApi.getFeed(pageParam, 20),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user,
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return null
  }

  const posts = data?.pages.flatMap((page) => page.posts) || []

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 pb-20 md:pb-8" role="main">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <header className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-4 -mt-4">
            <h1 className="text-2xl md:text-3xl font-bold">Feed</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh feed"
            >
              <RefreshCw className={cn('h-5 w-5', isFetching && 'animate-spin')} />
            </Button>
          </header>

          {isLoading ? (
            <div className="space-y-6" role="status" aria-label="Loading feed">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 md:py-20 space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-accent-primary/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-accent-primary" />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-balance">No posts yet</h2>
              <p className="text-foreground-secondary max-w-md mx-auto text-balance">
                Add friends to see their daily songs here. Or check back at 9:30pm when your friends reveal their songs!
              </p>
              <Button asChild size="lg" className="mt-4">
                <a href="/profile">Find Friends</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6" role="feed" aria-label="Music posts feed">
                {posts.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    priority={index < 3}
                  />
                ))}
              </div>
              
              {hasNextPage && (
                <div 
                  ref={observerTarget}
                  className="flex justify-center py-8"
                  role="status"
                  aria-live="polite"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-foreground-secondary">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => fetchNextPage()} 
                      variant="outline"
                      size="lg"
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}
              
              {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-8 text-foreground-secondary" role="status">
                  You're all caught up! 🎵
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
      <InstallPWAPrompt />
    </div>
  )
}
