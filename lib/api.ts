const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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
  getByUsername: (username: string) => api<any>(`/users/${username}`),
  deleteAccount: () => api('/users/me', { method: 'DELETE' }),
}

// Tracking endpoints
export const trackingApi = {
  sync: (data: any) => api('/tracking/sync', { method: 'POST', body: JSON.stringify(data) }),
  getToday: () => api<any>('/tracking/today'),
  getHistory: (startDate?: string, endDate?: string) => 
    api<any>('/tracking/history', { params: { startDate, endDate } as any }),
}

// Feed endpoints
export const feedApi = {
  getFeed: (page = 1, limit = 20) => 
    api<any>('/feed', { params: { page: page.toString(), limit: limit.toString() } }),
}

// Friends endpoints
export const friendsApi = {
  sendRequest: (userId: string) => 
    api('/friends/request', { method: 'POST', body: JSON.stringify({ userId }) }),
  acceptRequest: (requestId: string) => 
    api(`/friends/accept`, { method: 'POST', body: JSON.stringify({ requestId }) }),
  declineRequest: (requestId: string) => 
    api(`/friends/decline`, { method: 'POST', body: JSON.stringify({ requestId }) }),
  removeFriend: (friendId: string) => 
    api(`/friends/${friendId}`, { method: 'DELETE' }),
  getFriends: () => api<any>('/friends'),
  getRequests: () => api<any>('/friends/requests'),
  searchUsers: (query: string) => 
    api<any>('/users/search', { params: { q: query } }),
}

// Reactions endpoints
export const reactionsApi = {
  addReaction: (postId: string, emoji: string) => 
    api(`/posts/${postId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) }),
  removeReaction: (postId: string) => 
    api(`/posts/${postId}/react`, { method: 'DELETE' }),
  getReactions: (postId: string) => api<any>(`/posts/${postId}/reactions`),
}

// Comments endpoints
export const commentsApi = {
  addComment: (feedItemId: string, content: string) =>
    api('/comments', { method: 'POST', body: JSON.stringify({ feedItemId, content }) }),
  getComments: (feedItemId: string) => api<any>(`/comments/feed/${feedItemId}`),
  deleteComment: (commentId: string) =>
    api(`/comments/${commentId}`, { method: 'DELETE' }),
  toggleLike: (commentId: string) =>
    api(`/comments/${commentId}/like`, { method: 'POST' }),
  getLikes: (commentId: string) => api<any>(`/comments/${commentId}/likes`),
}

// Stats endpoints
export const statsApi = {
  getMyStats: () => api<any>('/stats/me'),
  getWeeklyRecap: () => api<any>('/stats/weekly'),
}

// Notifications endpoints
export const notificationsApi = {
  subscribe: (subscription: any) => 
    api('/notifications/subscribe', { method: 'POST', body: JSON.stringify(subscription) }),
  unsubscribe: () => 
    api('/notifications/unsubscribe', { method: 'POST' }),
}
