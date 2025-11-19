/**
 * Spotify API Client
 *
 * Provides methods to interact with Spotify Web API through our backend
 * Backend handles authentication and token management
 * Backend runs on port 3000 by default
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class SpotifyApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'SpotifyApiError'
  }
}

/**
 * Add a track to the user's Spotify queue
 * Requires an active Spotify device and Premium subscription
 */
async function addToQueue(trackUri: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/spotify/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ uri: trackUri }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))

      if (response.status === 404) {
        throw new SpotifyApiError('No active device found', 404)
      }

      if (response.status === 403) {
        throw new SpotifyApiError('Premium required', 403)
      }

      if (response.status === 401) {
        throw new SpotifyApiError('Not authenticated with Spotify', 401)
      }

      throw new SpotifyApiError(
        data.error?.message || 'Failed to add track to queue',
        response.status
      )
    }

    const data = await response.json()

    if (!data.success) {
      throw new SpotifyApiError(data.error?.message || 'Failed to add track to queue')
    }
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error
    }

    // Network error or JSON parse error
    throw new SpotifyApiError(
      error instanceof Error ? error.message : 'Network error'
    )
  }
}

/**
 * Play a track on the user's active Spotify device
 * Requires an active device and Premium subscription
 */
async function playTrack(trackUri: string, deviceId?: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/spotify/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        uri: trackUri,
        deviceId
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))

      if (response.status === 404) {
        throw new SpotifyApiError('No active device found', 404)
      }

      if (response.status === 403) {
        throw new SpotifyApiError('Premium required', 403)
      }

      throw new SpotifyApiError(
        data.error?.message || 'Failed to play track',
        response.status
      )
    }
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error
    }

    throw new SpotifyApiError(
      error instanceof Error ? error.message : 'Network error'
    )
  }
}

interface SpotifyUserDevice {
  id: string
  is_active: boolean
  is_restricted: boolean
  name: string
  type: string
  volume_percent?: number
}

/**
 * Get the user's available Spotify devices
 */
async function getDevices(): Promise<SpotifyUserDevice[]> {
  try {
    const response = await fetch(`${API_URL}/spotify/devices`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new SpotifyApiError(
        data.error?.message || 'Failed to get devices',
        response.status
      )
    }

    const data = await response.json()
    return data.devices || []
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error
    }

    throw new SpotifyApiError(
      error instanceof Error ? error.message : 'Network error'
    )
  }
}

/**
 * Get the user's currently playing track
 */
async function getCurrentlyPlaying(): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/spotify/currently-playing`, {
      method: 'GET',
      credentials: 'include',
    })

    if (response.status === 204) {
      // No track currently playing
      return null
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new SpotifyApiError(
        data.error?.message || 'Failed to get currently playing track',
        response.status
      )
    }

    const data = await response.json()
    return data.item
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error
    }

    throw new SpotifyApiError(
      error instanceof Error ? error.message : 'Network error'
    )
  }
}

/**
 * Search for tracks, artists, or albums
 */
async function search(
  query: string,
  type: 'track' | 'artist' | 'album' = 'track',
  limit: number = 20
): Promise<any> {
  try {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
    })

    const response = await fetch(`${API_URL}/spotify/search?${params}`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new SpotifyApiError(
        data.error?.message || 'Failed to search',
        response.status
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      throw error
    }

    throw new SpotifyApiError(
      error instanceof Error ? error.message : 'Network error'
    )
  }
}

export const spotifyApi = {
  addToQueue,
  playTrack,
  getDevices,
  getCurrentlyPlaying,
  search,
}

export { SpotifyApiError }
