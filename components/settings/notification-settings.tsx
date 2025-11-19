"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Bell, BellOff, Clock } from 'lucide-react'
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
  const [notificationTime, setNotificationTime] = useState('21:30') // Default 9:30 PM

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      checkSubscription()
    }

    // Load saved notification time from localStorage
    const savedTime = localStorage.getItem('notificationTime')
    if (savedTime) {
      setNotificationTime(savedTime)
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
            description: `You'll be notified daily at ${formatTime(notificationTime)}`,
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

  const handleTimeChange = (newTime: string) => {
    setNotificationTime(newTime)
    localStorage.setItem('notificationTime', newTime)

    if (notificationsEnabled) {
      toast({
        title: 'Notification time updated',
        description: `You'll now be notified at ${formatTime(newTime)}`,
      })
    }
  }

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
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
      <div className="rounded-lg border border-border p-6 space-y-6">
        <div className="flex items-start gap-4">
          <Bell className="h-5 w-5 text-accent-primary mt-0.5" />
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Browser Notifications</h3>
              <p className="text-sm text-foreground-secondary">
                Get notified when your song of the day is ready
              </p>
            </div>

            {permission === 'denied' ? (
              <div className="p-4 rounded-lg bg-error/10 text-error text-sm">
                Notifications are blocked. Please enable them in your browser settings.
              </div>
            ) : permission === 'default' ? (
              <Button onClick={handleRequestPermission} disabled={loading}>
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="cursor-pointer font-medium">
                    Daily notifications
                  </Label>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleToggleNotifications}
                    disabled={loading}
                  />
                </div>

                {notificationsEnabled && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-foreground-secondary" />
                      <Label htmlFor="notification-time" className="text-sm font-medium">
                        Preferred notification time
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        id="notification-time"
                        type="time"
                        value={notificationTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-auto"
                      />
                      <span className="text-sm text-foreground-tertiary">
                        {formatTime(notificationTime)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-tertiary">
                      Choose when you'd like to receive your daily music recap notification
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-foreground-tertiary space-y-1">
        <p>
          <strong>Note:</strong> Notifications work best when Replay is installed as a PWA or when the browser tab is kept open.
        </p>
        <p className="text-xs">
          Current implementation stores time preference locally. Backend sync for custom notification times coming soon.
        </p>
      </div>
    </div>
  )
}
