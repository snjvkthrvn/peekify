"use client"

import { notificationsApi } from './api'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[v0] Browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function subscribeToPushNotifications(): Promise<boolean> {
  try {
    const permission = await requestNotificationPermission()
    if (!permission) {
      return false
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      // Send subscription to backend
      await notificationsApi.subscribe(subscription.toJSON())
      
      return true
    }

    return false
  } catch (error) {
    console.error('[v0] Failed to subscribe to push notifications:', error)
    return false
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await notificationsApi.unsubscribe()
          return true
        }
      }
    }
    return false
  } catch (error) {
    console.error('[v0] Failed to unsubscribe from push notifications:', error)
    return false
  }
}

export function showLocalNotification(title: string, body: string, icon?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
    })
  }
}
