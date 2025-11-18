const CACHE_VERSION = 'v2'
const CACHE_NAME = `replay-${CACHE_VERSION}`
const RUNTIME_CACHE = `replay-runtime-${CACHE_VERSION}`

const STATIC_ASSETS = [
  '/',
  '/feed',
  '/calendar',
  '/profile',
  '/offline',
  '/manifest.json',
]

const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first',
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[v0] Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[v0] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[v0] Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[v0] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip chrome extensions and non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // API requests - network first
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })

            return response
          })
          .catch(() => {
            // Fallback to offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline')
            }
          })
      })
  )
})

// Push notification handler with Firebase support
self.addEventListener('push', (event) => {
  console.log('[v0] Push notification received')
  
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    console.error('[v0] Failed to parse push data:', e)
  }

  const title = data.title || 'Replay'
  const options = {
    body: data.body || 'Your song of the day is ready! 🎵',
    icon: '/icon-192.jpg',
    badge: '/icon-192.jpg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/feed',
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[v0] Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/feed'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync for offline actions (placeholder)
self.addEventListener('sync', (event) => {
  console.log('[v0] Background sync:', event.tag)
  
  if (event.tag === 'sync-reactions') {
    event.waitUntil(syncReactions())
  }
})

async function syncReactions() {
  // Placeholder for background sync logic
  console.log('[v0] Syncing reactions...')
  // In production, sync pending reactions from IndexedDB to server
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[v0] Service Worker message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
