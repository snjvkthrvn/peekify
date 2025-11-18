/**
 * History Controller
 * Handles listening history operations
 */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { cache } = require('../config/redis');
const { getRecentlyPlayed } = require('../services/spotifyService');
const { asyncHandler } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * POST /history/sync
 * Sync recent tracks from Spotify
 */
const syncHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get recently played tracks from Spotify
  const tracks = await getRecentlyPlayed(userId, 50);

  let syncedCount = 0;

  // Insert tracks into database (ignore duplicates)
  for (const track of tracks) {
    try {
      await query(
        `INSERT INTO listening_history
         (id, user_id, spotify_track_id, track_name, artist_name, album_name, album_image_url, played_at, duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [
          uuidv4(),
          userId,
          track.trackId,
          track.trackName,
          track.artistName,
          track.albumName,
          track.albumImage,
          track.playedAt,
          track.durationMs,
        ]
      );
      syncedCount++;
    } catch (error) {
      logger.error('Failed to insert track', {
        userId,
        trackId: track.trackId,
        error: error.message,
      });
    }
  }

  // Invalidate cache
  await cache.del(`history:${userId}`);

  logger.info('Listening history synced', { userId, syncedCount, totalTracks: tracks.length });

  res.json({
    success: true,
    synced: syncedCount,
    total: tracks.length,
  });
});

/**
 * GET /history
 * Get listening history for current user
 */
const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0, startDate, endDate } = req.query;

  // Check cache first (30 second TTL)
  const cacheKey = `history:${userId}:${limit}:${offset}:${startDate}:${endDate}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    logger.debug('Returning cached history', { userId });
    return res.json({
      success: true,
      history: cached.history,
      pagination: cached.pagination,
      cached: true,
    });
  }

  // Build query with optional date filters
  let historyQuery = `
    SELECT
      id,
      spotify_track_id,
      track_name,
      artist_name,
      album_name,
      album_image_url,
      played_at,
      duration_ms
    FROM listening_history
    WHERE user_id = $1
  `;

  const params = [userId];
  let paramCount = 2;

  if (startDate) {
    historyQuery += ` AND played_at >= $${paramCount}`;
    params.push(new Date(startDate));
    paramCount++;
  }

  if (endDate) {
    historyQuery += ` AND played_at <= $${paramCount}`;
    params.push(new Date(endDate));
    paramCount++;
  }

  historyQuery += ` ORDER BY played_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await query(historyQuery, params);

  const history = result.rows.map((track) => ({
    id: track.id,
    trackId: track.spotify_track_id,
    trackName: track.track_name,
    artistName: track.artist_name,
    albumName: track.album_name,
    albumImage: track.album_image_url,
    playedAt: track.played_at,
    durationMs: track.duration_ms,
  }));

  const response = {
    history,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: history.length,
    },
  };

  // Cache for 30 seconds
  await cache.set(cacheKey, response, 30);

  res.json({
    success: true,
    ...response,
    cached: false,
  });
});

/**
 * GET /history/stats
 * Get listening statistics
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = '7d' } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startDate;

  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get total tracks and minutes
  const statsResult = await query(
    `SELECT
      COUNT(*) as total_tracks,
      SUM(duration_ms) as total_ms
    FROM listening_history
    WHERE user_id = $1 AND played_at >= $2`,
    [userId, startDate]
  );

  const totalTracks = parseInt(statsResult.rows[0].total_tracks);
  const totalMinutes = Math.floor((statsResult.rows[0].total_ms || 0) / 60000);

  // Get unique artists count
  const artistsResult = await query(
    `SELECT COUNT(DISTINCT artist_name) as unique_artists
    FROM listening_history
    WHERE user_id = $1 AND played_at >= $2`,
    [userId, startDate]
  );

  const uniqueArtists = parseInt(artistsResult.rows[0].unique_artists);

  res.json({
    success: true,
    stats: {
      period,
      totalTracks,
      totalMinutes,
      uniqueArtists,
    },
  });
});

module.exports = {
  syncHistory,
  getHistory,
  getStats,
};
