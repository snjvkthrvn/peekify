/**
 * Recap Service
 * Generates daily listening recaps for users
 * Analyzes listening history and creates summaries
 */

const { query } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Generate daily recap for a user
 * @param {string} userId - User ID
 * @param {Date} date - Date to generate recap for (defaults to yesterday)
 * @returns {Promise<Object>} Recap data
 */
async function generateDailyRecap(userId, date = null) {
  try {
    // Default to yesterday
    const recapDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const startOfDay = new Date(recapDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(recapDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all tracks played on this day
    const tracksResult = await query(
      `SELECT
        spotify_track_id,
        track_name,
        artist_name,
        album_name,
        album_image_url,
        duration_ms,
        played_at
      FROM listening_history
      WHERE user_id = $1
        AND played_at >= $2
        AND played_at <= $3
      ORDER BY played_at ASC`,
      [userId, startOfDay, endOfDay]
    );

    const tracks = tracksResult.rows;

    if (tracks.length === 0) {
      logger.info('No tracks found for recap', { userId, date: recapDate });
      return null;
    }

    // Calculate statistics
    const totalTracks = tracks.length;
    const totalMinutes = Math.floor(
      tracks.reduce((sum, track) => sum + (track.duration_ms || 0), 0) / 60000
    );

    // Get top tracks (most played)
    const trackCounts = {};
    tracks.forEach((track) => {
      const key = track.spotify_track_id;
      if (!trackCounts[key]) {
        trackCounts[key] = {
          trackId: track.spotify_track_id,
          trackName: track.track_name,
          artistName: track.artist_name,
          albumImage: track.album_image_url,
          count: 0,
        };
      }
      trackCounts[key].count++;
    });

    const topTracks = Object.values(trackCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get top artists (most listened to)
    const artistCounts = {};
    tracks.forEach((track) => {
      const artists = track.artist_name.split(', ');
      artists.forEach((artist) => {
        if (!artistCounts[artist]) {
          artistCounts[artist] = { artistName: artist, count: 0 };
        }
        artistCounts[artist].count++;
      });
    });

    const topArtists = Object.values(artistCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Create recap object
    const recap = {
      userId,
      recapDate: recapDate.toISOString().split('T')[0],
      totalTracks,
      totalMinutes,
      topTracks,
      topArtists,
    };

    // Save recap to database
    await query(
      `INSERT INTO daily_recaps (user_id, recap_date, total_tracks, total_minutes, top_tracks, top_artists)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, recap_date)
       DO UPDATE SET
         total_tracks = EXCLUDED.total_tracks,
         total_minutes = EXCLUDED.total_minutes,
         top_tracks = EXCLUDED.top_tracks,
         top_artists = EXCLUDED.top_artists`,
      [
        userId,
        recap.recapDate,
        totalTracks,
        totalMinutes,
        JSON.stringify(topTracks),
        JSON.stringify(topArtists),
      ]
    );

    logger.info('Daily recap generated', { userId, date: recap.recapDate, totalTracks });
    return recap;
  } catch (error) {
    logger.error('Failed to generate daily recap', {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get recap for a specific date
 * @param {string} userId - User ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Recap data
 */
async function getRecap(userId, date) {
  try {
    const result = await query(
      `SELECT * FROM daily_recaps WHERE user_id = $1 AND recap_date = $2`,
      [userId, date]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const recap = result.rows[0];
    return {
      userId: recap.user_id,
      recapDate: recap.recap_date,
      totalTracks: recap.total_tracks,
      totalMinutes: recap.total_minutes,
      topTracks: recap.top_tracks,
      topArtists: recap.top_artists,
      createdAt: recap.created_at,
    };
  } catch (error) {
    logger.error('Failed to get recap', { userId, date, error: error.message });
    throw error;
  }
}

/**
 * Get all recaps for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of recaps to return
 * @returns {Promise<Array>} Array of recap data
 */
async function getUserRecaps(userId, limit = 30) {
  try {
    const result = await query(
      `SELECT * FROM daily_recaps
       WHERE user_id = $1
       ORDER BY recap_date DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map((recap) => ({
      userId: recap.user_id,
      recapDate: recap.recap_date,
      totalTracks: recap.total_tracks,
      totalMinutes: recap.total_minutes,
      topTracks: recap.top_tracks,
      topArtists: recap.top_artists,
      createdAt: recap.created_at,
    }));
  } catch (error) {
    logger.error('Failed to get user recaps', {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Generate recap summary text
 * @param {Object} recap - Recap data
 * @returns {string} Summary text
 */
function generateRecapSummary(recap) {
  const { totalTracks, totalMinutes, topTracks, topArtists } = recap;

  let summary = `You listened to ${totalTracks} track${totalTracks !== 1 ? 's' : ''} `;
  summary += `for ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}. `;

  if (topTracks && topTracks.length > 0) {
    summary += `Your most played track was "${topTracks[0].trackName}" by ${topTracks[0].artistName}. `;
  }

  if (topArtists && topArtists.length > 0) {
    summary += `Your top artist was ${topArtists[0].artistName}.`;
  }

  return summary;
}

module.exports = {
  generateDailyRecap,
  getRecap,
  getUserRecaps,
  generateRecapSummary,
};
