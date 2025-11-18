/**
 * Spotify Service
 * Handles all interactions with Spotify API
 * Includes OAuth flow and data fetching
 */

const axios = require('axios');
const spotifyConfig = require('../config/spotify');
const { query } = require('../config/db');
const { InternalServerError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Exchange authorization code for access and refresh tokens
 * @param {string} code - Authorization code from Spotify
 * @returns {Promise<Object>} Token data
 */
async function getTokens(code) {
  try {
    const response = await axios.post(
      spotifyConfig.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: spotifyConfig.redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
            ).toString('base64'),
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    logger.error('Failed to exchange code for tokens', {
      error: error.response?.data || error.message,
    });
    throw new BadRequestError('Failed to authenticate with Spotify');
  }
}

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Spotify refresh token
 * @returns {Promise<Object>} New token data
 */
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post(
      spotifyConfig.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
            ).toString('base64'),
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error) {
    logger.error('Failed to refresh access token', {
      error: error.response?.data || error.message,
    });
    throw new InternalServerError('Failed to refresh Spotify token');
  }
}

/**
 * Get valid access token for user (refresh if expired)
 * @param {string} userId - User ID
 * @returns {Promise<string>} Valid access token
 */
async function getValidAccessToken(userId) {
  // Get tokens from database
  const result = await query(
    'SELECT access_token, refresh_token, expires_at FROM spotify_tokens WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new BadRequestError('Spotify not connected');
  }

  const { access_token, refresh_token, expires_at } = result.rows[0];

  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(expires_at);

  if (now < expiresAt) {
    // Token is still valid
    return access_token;
  }

  // Token is expired, refresh it
  logger.info('Refreshing Spotify token', { userId });
  const tokenData = await refreshAccessToken(refresh_token);

  // Update tokens in database
  const newExpiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);
  await query(
    'UPDATE spotify_tokens SET access_token = $1, expires_at = $2 WHERE user_id = $3',
    [tokenData.accessToken, newExpiresAt, userId]
  );

  return tokenData.accessToken;
}

/**
 * Get user profile from Spotify
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<Object>} User profile
 */
async function getUserProfile(accessToken) {
  try {
    const response = await axios.get(`${spotifyConfig.apiBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      spotifyId: response.data.id,
      email: response.data.email,
      displayName: response.data.display_name,
      images: response.data.images,
    };
  } catch (error) {
    logger.error('Failed to get user profile', {
      error: error.response?.data || error.message,
    });
    throw new InternalServerError('Failed to fetch Spotify profile');
  }
}

/**
 * Get recently played tracks from Spotify
 * @param {string} userId - User ID
 * @param {number} limit - Number of tracks to fetch (max 50)
 * @returns {Promise<Array>} Recently played tracks
 */
async function getRecentlyPlayed(userId, limit = 50) {
  const accessToken = await getValidAccessToken(userId);

  try {
    const response = await axios.get(
      `${spotifyConfig.apiBaseUrl}/me/player/recently-played`,
      {
        params: { limit },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.items.map((item) => ({
      trackId: item.track.id,
      trackName: item.track.name,
      artistName: item.track.artists.map((a) => a.name).join(', '),
      albumName: item.track.album.name,
      albumImage: item.track.album.images[0]?.url,
      playedAt: item.played_at,
      durationMs: item.track.duration_ms,
    }));
  } catch (error) {
    logger.error('Failed to get recently played tracks', {
      userId,
      error: error.response?.data || error.message,
    });
    throw new InternalServerError('Failed to fetch listening history');
  }
}

/**
 * Get user's top tracks
 * @param {string} userId - User ID
 * @param {string} timeRange - Time range (short_term, medium_term, long_term)
 * @param {number} limit - Number of tracks to fetch
 * @returns {Promise<Array>} Top tracks
 */
async function getTopTracks(userId, timeRange = 'medium_term', limit = 20) {
  const accessToken = await getValidAccessToken(userId);

  try {
    const response = await axios.get(
      `${spotifyConfig.apiBaseUrl}/me/top/tracks`,
      {
        params: { time_range: timeRange, limit },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.items.map((track) => ({
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists.map((a) => a.name).join(', '),
      albumName: track.album.name,
      albumImage: track.album.images[0]?.url,
      popularity: track.popularity,
    }));
  } catch (error) {
    logger.error('Failed to get top tracks', {
      userId,
      error: error.response?.data || error.message,
    });
    throw new InternalServerError('Failed to fetch top tracks');
  }
}

/**
 * Get user's top artists
 * @param {string} userId - User ID
 * @param {string} timeRange - Time range (short_term, medium_term, long_term)
 * @param {number} limit - Number of artists to fetch
 * @returns {Promise<Array>} Top artists
 */
async function getTopArtists(userId, timeRange = 'medium_term', limit = 20) {
  const accessToken = await getValidAccessToken(userId);

  try {
    const response = await axios.get(
      `${spotifyConfig.apiBaseUrl}/me/top/artists`,
      {
        params: { time_range: timeRange, limit },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.items.map((artist) => ({
      artistId: artist.id,
      artistName: artist.name,
      genres: artist.genres,
      image: artist.images[0]?.url,
      popularity: artist.popularity,
    }));
  } catch (error) {
    logger.error('Failed to get top artists', {
      userId,
      error: error.response?.data || error.message,
    });
    throw new InternalServerError('Failed to fetch top artists');
  }
}

/**
 * Get currently playing track
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Currently playing track or null
 */
async function getCurrentlyPlaying(userId) {
  const accessToken = await getValidAccessToken(userId);

  try {
    const response = await axios.get(
      `${spotifyConfig.apiBaseUrl}/me/player/currently-playing`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.data || !response.data.item) {
      return null;
    }

    const track = response.data.item;
    return {
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists.map((a) => a.name).join(', '),
      albumName: track.album.name,
      albumImage: track.album.images[0]?.url,
      isPlaying: response.data.is_playing,
      progressMs: response.data.progress_ms,
      durationMs: track.duration_ms,
    };
  } catch (error) {
    if (error.response?.status === 204) {
      // No content - nothing is playing
      return null;
    }
    logger.error('Failed to get currently playing', {
      userId,
      error: error.response?.data || error.message,
    });
    return null;
  }
}

module.exports = {
  getTokens,
  refreshAccessToken,
  getValidAccessToken,
  getUserProfile,
  getRecentlyPlayed,
  getTopTracks,
  getTopArtists,
  getCurrentlyPlaying,
};
