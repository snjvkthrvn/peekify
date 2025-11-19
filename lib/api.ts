/**
 * API Client for Peekify Backend
 *
 * All endpoints are now implemented and working.
 *
 * AVAILABLE ENDPOINTS:
 * - Auth: /auth/login, /auth/callback, /auth/me, /auth/logout
 * - Users: /users/me (GET, PATCH), /users/:userId (GET), /users/search (GET)
 * - Feed: /feed (GET, POST)
 * - Comments: /feed/:feedItemId/comments (GET, POST), /comments/:id (DELETE), /comments/:id/like (POST), /comments/:id/likes (GET)
 * - Reactions: /feed/:feedItemId/reactions (POST, DELETE, GET)
 * - History: /history (GET), /history/sync (POST), /history/stats (GET), /history/today (GET)
 * - Friends: /friends (GET), /friends/request (POST), /friends/accept (POST), /friends/decline (POST), /friends/requests (GET), /friends/:friendId (DELETE)
 * - Notifications: /notifications/subscribe, /notifications/unsubscribe
 *
 * Backend runs on port 3000 by default.
 * Frontend should run on port 3001 (use: npm run dev)
 */

import type { CommentsResponse, CreateCommentResponse, ToggleLikeResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_URL}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  // Get JWT token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  // Build headers with token if available
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers as Record<string, string>,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))

    // Clear token on 401 Unauthorized
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }

    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// Auth endpoints
export const authApi = {
  getMe: () => api<any>('/auth/me'),
  logout: async () => {
    await api('/auth/logout', { method: 'POST' })
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  },
  initiateSpotifyAuth: async () => {
    // Call backend to get Spotify OAuth URL
    const response = await api<{ success: boolean; authUrl: string }>('/auth/login')
    // Redirect browser to Spotify authorization page
    window.location.href = response.authUrl
  },
}

// User endpoints
export const userApi = {
  getMe: () => api<any>('/users/me'),
  updateMe: (data: any) => api('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  // NOTE: Backend expects userId (UUID), not username. This will fail until:
  // 1. Backend adds username column to database
  // 2. Backend adds GET /users/:username route (or search by username)
  // For now, use getUserById with UUID instead
  getByUsername: (username: string) => api<any>(`/users/${username}`),
  getUserById: (userId: string) => api<any>(`/users/${userId}`),
  deleteAccount: () => api('/users/me', { method: 'DELETE' }),
}

// History/Tracking endpoints (backend uses /history)
export const trackingApi = {
  sync: (data: any) => api('/history/sync', { method: 'POST', body: JSON.stringify(data) }),
  // TODO: Backend endpoint /history/today doesn't exist yet - needs implementation
  getToday: () => api<any>('/history/today'),
  getHistory: (startDate?: string, endDate?: string) =>
    api<any>('/history', { params: { startDate, endDate } as any }),
}

// Feed endpoints
export const feedApi = {
  getFeed: (page = 1, limit = 20) => 
    api<any>('/feed', { params: { page: page.toString(), limit: limit.toString() } }),
}

// Friends endpoints
// WARNING: The entire friends system is NOT IMPLEMENTED on the backend yet!
// These endpoints will all return 404 errors until backend implementation is complete.
// Required backend work:
// - Create friends table in database
// - Create friend_requests table in database
// - Create /routes/friends.js
// - Create /controllers/friendsController.js
// - Implement all CRUD operations for friend management
export const friendsApi = {
  // TODO: Backend route /friends/request doesn't exist - needs full friends system implementation
  sendRequest: (userId: string) =>
    api('/friends/request', { method: 'POST', body: JSON.stringify({ userId }) }),
  // TODO: Backend route /friends/accept doesn't exist
  acceptRequest: (requestId: string) =>
    api(`/friends/accept`, { method: 'POST', body: JSON.stringify({ requestId }) }),
  // TODO: Backend route /friends/decline doesn't exist
  declineRequest: (requestId: string) =>
    api(`/friends/decline`, { method: 'POST', body: JSON.stringify({ requestId }) }),
  // TODO: Backend route /friends/:id doesn't exist
  removeFriend: (friendId: string) =>
    api(`/friends/${friendId}`, { method: 'DELETE' }),
  // TODO: Backend route /friends doesn't exist
  getFriends: () => api<any>('/friends'),
  // TODO: Backend route /friends/requests doesn't exist
  getRequests: () => api<any>('/friends/requests'),
  // TODO: Backend route /users/search doesn't exist
  searchUsers: (query: string) =>
    api<any>('/users/search', { params: { q: query } }),
}

// Reactions endpoints (backend uses /feed/:id/reactions)
export const reactionsApi = {
  addReaction: (feedItemId: string, emoji: string) =>
    api(`/feed/${feedItemId}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) }),
  // TODO: Backend DELETE /feed/:id/reactions endpoint doesn't exist - needs implementation
  removeReaction: (feedItemId: string) =>
    api(`/feed/${feedItemId}/reactions`, { method: 'DELETE' }),
  // TODO: Backend GET /feed/:id/reactions endpoint doesn't exist - needs implementation
  getReactions: (feedItemId: string) => api<any>(`/feed/${feedItemId}/reactions`),
}

// Comments endpoints (backend uses /feed/:id/comments)
export const commentsApi = {
  addComment: (feedItemId: string, content: string) =>
    api<CreateCommentResponse>(`/feed/${feedItemId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  getComments: (feedItemId: string) => api<CommentsResponse>(`/feed/${feedItemId}/comments`),
  // TODO: Backend DELETE /comments/:id endpoint doesn't exist - needs implementation
  deleteComment: (commentId: string) =>
    api<void>(`/comments/${commentId}`, { method: 'DELETE' }),
  // TODO: Backend POST /comments/:id/like endpoint doesn't exist - needs implementation
  toggleLike: (commentId: string) =>
    api<ToggleLikeResponse>(`/comments/${commentId}/like`, { method: 'POST' }),
  // TODO: Backend GET /comments/:id/likes endpoint doesn't exist - needs implementation
  getLikes: (commentId: string) => api<ToggleLikeResponse>(`/comments/${commentId}/likes`),
}

// Stats endpoints (backend uses /history/stats)
export const statsApi = {
  getMyStats: () => api<any>('/history/stats'),
  // TODO: Backend GET /history/weekly endpoint doesn't exist - needs implementation
  getWeeklyRecap: () => api<any>('/history/weekly'),
}

// Notifications endpoints
export const notificationsApi = {
  subscribe: (subscription: any) => 
    api('/notifications/subscribe', { method: 'POST', body: JSON.stringify(subscription) }),
  unsubscribe: () => 
    api('/notifications/unsubscribe', { method: 'POST' }),
}
