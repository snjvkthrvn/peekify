/**
 * Auth Controller
 * Handles Spotify OAuth authentication flow
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const spotifyConfig = require('../config/spotify');
const { query } = require('../config/db');
const { cache, session } = require('../config/redis');
const { getTokens, getUserProfile } = require('../services/spotifyService');
const { asyncHandler, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * GET /auth/login
 * Initiates Spotify OAuth flow
 */
const login = asyncHandler(async (req, res) => {
  // Generate random state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  // Store state in Redis with 10 minute expiry
  await cache.set(`auth:state:${state}`, { timestamp: Date.now() }, 600);

  // Generate Spotify authorization URL
  const authUrl = spotifyConfig.getAuthUrl(state);

  logger.info('Spotify OAuth initiated');

  res.json({
    success: true,
    authUrl,
  });
});

/**
 * GET /auth/callback
 * Handles Spotify OAuth callback
 */
const callback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  // Check for errors from Spotify
  if (error) {
    logger.error('Spotify OAuth error', { error });
    throw new BadRequestError(`Spotify OAuth failed: ${error}`);
  }

  if (!code || !state) {
    throw new BadRequestError('Missing code or state parameter');
  }

  // Verify state to prevent CSRF
  const storedState = await cache.get(`auth:state:${state}`);
  if (!storedState) {
    throw new BadRequestError('Invalid or expired state parameter');
  }

  // Delete used state
  await cache.del(`auth:state:${state}`);

  // Exchange code for tokens
  const tokenData = await getTokens(code);

  // Get user profile from Spotify
  const profile = await getUserProfile(tokenData.accessToken);

  // Check if user already exists
  let userResult = await query(
    'SELECT id FROM users WHERE spotify_id = $1',
    [profile.spotifyId]
  );

  let userId;

  if (userResult.rows.length === 0) {
    // Create new user
    const newUserId = uuidv4();
    await query(
      `INSERT INTO users (id, spotify_id, email, display_name, profile_picture_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        newUserId,
        profile.spotifyId,
        profile.email,
        profile.displayName,
        profile.images?.[0]?.url || null,
      ]
    );
    userId = newUserId;
    logger.info('New user created', { userId, spotifyId: profile.spotifyId });
  } else {
    // Update existing user
    userId = userResult.rows[0].id;
    await query(
      `UPDATE users
       SET email = $1, display_name = $2, profile_picture_url = $3
       WHERE id = $4`,
      [profile.email, profile.displayName, profile.images?.[0]?.url || null, userId]
    );
    logger.info('Existing user updated', { userId });
  }

  // Save or update Spotify tokens
  const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);
  await query(
    `INSERT INTO spotify_tokens (user_id, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id)
     DO UPDATE SET
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       expires_at = EXCLUDED.expires_at`,
    [userId, tokenData.accessToken, tokenData.refreshToken, expiresAt]
  );

  // Create JWT token
  const jwtToken = jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Save session in Redis
  await session.save(userId, {
    spotifyId: profile.spotifyId,
    email: profile.email,
    displayName: profile.displayName,
  });

  logger.info('User authenticated successfully', { userId });

  // Redirect to frontend with token
  const redirectUrl = `${config.frontend.url}/auth/callback?token=${jwtToken}`;
  res.redirect(redirectUrl);
});

/**
 * POST /auth/logout
 * Logs out user by deleting session
 */
const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Delete session from Redis
  await session.delete(userId);

  logger.info('User logged out', { userId });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /auth/me
 * Get current user info (if authenticated)
 */
const me = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user from database
  const result = await query(
    'SELECT id, spotify_id, email, display_name, profile_picture_url, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new BadRequestError('User not found');
  }

  const user = result.rows[0];

  res.json({
    success: true,
    user: {
      id: user.id,
      spotifyId: user.spotify_id,
      email: user.email,
      displayName: user.display_name,
      profilePicture: user.profile_picture_url,
      createdAt: user.created_at,
    },
  });
});

module.exports = {
  login,
  callback,
  logout,
  me,
};
