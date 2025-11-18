"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, BellOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  requestNotificationPermission,
} from '@/lib/notifications'

export function NotificationSettings() {
  const { toast } = useToast()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        setNotificationsEnabled(subscription !== null)
      }
    }
  }

  const handleToggleNotifications = async (enabled: boolean) => {
    setLoading(true)
    try {
      if (enabled) {
        const success = await subscribeToPushNotifications()
        if (success) {
          setNotificationsEnabled(true)
          setPermission('granted')
          toast({
            title: 'Notifications enabled',
            description: "You'll be notified at 9:30pm daily",
          })
        } else {
          toast({
            title: 'Failed to enable notifications',
            description: 'Please allow notifications in your browser settings',
            variant: 'destructive',
          })
        }
      } else {
        const success = await unsubscribeFromPushNotifications()
        if (success) {
          setNotificationsEnabled(false)
          toast({
            title: 'Notifications disabled',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPermission('granted')
      await handleToggleNotifications(true)
    } else {
      toast({
        title: 'Permission denied',
        description: 'Please enable notifications in your browser settings',
        variant: 'destructive',
      })
    }
  }

  if (!('Notification' in window)) {
    return (
      <div className="rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-start gap-4">
          <BellOff className="h-5 w-5 text-foreground-tertiary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Notifications Not Supported</h3>
            <p className="text-sm text-foreground-secondary">
              Your browser doesn't support push notifications. Try using Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Bell className="h-5 w-5 text-accent-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Browser Notifications</h3>
            <p className="text-sm text-foreground-secondary mb-4">
              Get notified when your song of the day is ready at 9:30pm
            </p>

            {permission === 'denied' ? (
              <div className="p-4 rounded-lg bg-error/10 text-error text-sm">
                Notifications are blocked. Please enable them in your browser settings.
              </div>
            ) : permission === 'default' ? (
              <Button onClick={handleRequestPermission} disabled={loading}>
                Enable Notifications
              </Button>
            ) : (
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="cursor-pointer">
                  Daily notifications at 9:30pm
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-foreground-tertiary">
        <strong>Note:</strong> Notifications work best when Replay is installed as a PWA or when the browser tab is kept open.
      </div>
    </div>
  )
}
