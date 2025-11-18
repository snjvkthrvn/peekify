"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2, Save } from 'lucide-react'
import { userApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout, refreshUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    privacyLevel: 'friends' as 'private' | 'friends' | 'public',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        bio: user.bio || '',
        privacyLevel: user.privacyLevel,
      })
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => userApi.updateMe(data),
    onSuccess: async () => {
      await refreshUser()
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast({
        title: 'Settings saved',
        description: 'Your profile has been updated',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: async () => {
      await logout()
      router.push('/')
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete account',
        variant: 'destructive',
      })
    },
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      
      <main className="flex-1 pb-20 md:pb-8" role="main">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <header>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
            <p className="text-foreground-secondary">
              Manage your profile, privacy, and notification preferences
            </p>
          </header>

          {/* Profile Settings */}
          <section className="space-y-6 rounded-xl border border-border p-6 bg-background-secondary">
            <h2 className="text-xl font-semibold">Profile</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Your username"
                  aria-required="true"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your music taste..."
                  maxLength={150}
                  rows={3}
                  aria-describedby="bio-hint"
                />
                <p id="bio-hint" className="text-xs text-foreground-tertiary text-right">
                  {formData.bio.length}/150
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="space-y-6 rounded-xl border border-border p-6 bg-background-secondary">
            <h2 className="text-xl font-semibold">Privacy</h2>

            <div className="space-y-2">
              <Label htmlFor="privacy">Who can see your music?</Label>
              <Select
                value={formData.privacyLevel}
                onValueChange={(value: any) => setFormData({ ...formData, privacyLevel: value })}
              >
                <SelectTrigger id="privacy" aria-describedby="privacy-description">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private - Only me</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="public">Public - Everyone</SelectItem>
                </SelectContent>
              </Select>
              <p id="privacy-description" className="text-sm text-foreground-tertiary">
                {formData.privacyLevel === 'private' &&
                  'Only you can see your daily songs and music history'}
                {formData.privacyLevel === 'friends' &&
                  'Only friends you add can see your music'}
                {formData.privacyLevel === 'public' &&
                  'Anyone can see your profile and daily songs'}
              </p>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="space-y-6 rounded-xl border border-border p-6 bg-background-secondary">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <NotificationSettings />
          </section>

          {/* Save Button */}
          <Button
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="w-full"
            size="lg"
          >
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>

          {/* Danger Zone */}
          <section className="space-y-6 rounded-xl border border-error/50 bg-error/5 p-6">
            <div>
              <h2 className="text-xl font-semibold text-error mb-2">Danger Zone</h2>
              <p className="text-sm text-foreground-secondary">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" size="lg">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers including your music history,
                    friends, and posts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="bg-error hover:bg-error/90"
                  >
                    {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
