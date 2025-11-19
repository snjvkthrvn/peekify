/**
 * User Controller
 * Handles user profile operations
 */

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { uploadFile } = require('../config/supabase');
const { asyncHandler, BadRequestError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files are allowed'));
    }
  },
});

/**
 * GET /users/me
 * Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT id, spotify_id, email, display_name, profile_picture_url, username, bio,
            privacy_level, timezone, notification_time, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
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
      username: user.username,
      bio: user.bio,
      privacyLevel: user.privacy_level,
      timezone: user.timezone,
      notificationTime: user.notification_time,
      createdAt: user.created_at,
    },
  });
});

/**
 * PATCH /users/me
 * Update current user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { displayName, email, username, bio, privacyLevel, timezone, notificationTime } = req.body;

  // Build update query dynamically
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (displayName !== undefined) {
    updates.push(`display_name = $${paramCount}`);
    values.push(displayName);
    paramCount++;
  }

  if (email !== undefined) {
    updates.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }

  if (username !== undefined) {
    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      throw new BadRequestError('Username must be 3-50 characters and contain only letters, numbers, and underscores');
    }
    updates.push(`username = $${paramCount}`);
    values.push(username);
    paramCount++;
  }

  if (bio !== undefined) {
    // Limit bio length
    if (bio.length > 500) {
      throw new BadRequestError('Bio must be 500 characters or less');
    }
    updates.push(`bio = $${paramCount}`);
    values.push(bio);
    paramCount++;
  }

  if (privacyLevel !== undefined) {
    // Validate privacy level
    if (!['private', 'friends', 'public'].includes(privacyLevel)) {
      throw new BadRequestError('Privacy level must be private, friends, or public');
    }
    updates.push(`privacy_level = $${paramCount}`);
    values.push(privacyLevel);
    paramCount++;
  }

  if (timezone !== undefined) {
    updates.push(`timezone = $${paramCount}`);
    values.push(timezone);
    paramCount++;
  }

  if (notificationTime !== undefined) {
    // Validate time format (HH:MM)
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(notificationTime)) {
      throw new BadRequestError('Notification time must be in HH:MM format');
    }
    updates.push(`notification_time = $${paramCount}`);
    values.push(notificationTime);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new BadRequestError('No fields to update');
  }

  values.push(userId);

  const updateQuery = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, spotify_id, email, display_name, profile_picture_url, username, bio,
              privacy_level, timezone, notification_time, created_at
  `;

  const result = await query(updateQuery, values);
  const user = result.rows[0];

  logger.info('User profile updated', { userId });

  res.json({
    success: true,
    user: {
      id: user.id,
      spotifyId: user.spotify_id,
      email: user.email,
      displayName: user.display_name,
      profilePicture: user.profile_picture_url,
      username: user.username,
      bio: user.bio,
      privacyLevel: user.privacy_level,
      timezone: user.timezone,
      notificationTime: user.notification_time,
      createdAt: user.created_at,
    },
  });
});

/**
 * POST /users/me/avatar
 * Upload profile picture
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  // Generate unique filename
  const fileExt = req.file.mimetype.split('/')[1];
  const fileName = `avatars/${userId}-${uuidv4()}.${fileExt}`;

  // Upload to Supabase Storage
  const publicUrl = await uploadFile(
    fileName,
    req.file.buffer,
    req.file.mimetype
  );

  // Update user's profile picture URL
  await query(
    'UPDATE users SET profile_picture_url = $1 WHERE id = $2',
    [publicUrl, userId]
  );

  logger.info('Profile picture uploaded', { userId, url: publicUrl });

  res.json({
    success: true,
    profilePicture: publicUrl,
  });
});

/**
 * GET /users/:userId
 * Get public user profile
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await query(
    `SELECT id, display_name, profile_picture_url, username, bio, privacy_level, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  const user = result.rows[0];

  res.json({
    success: true,
    user: {
      id: user.id,
      displayName: user.display_name,
      profilePicture: user.profile_picture_url,
      username: user.username,
      bio: user.bio,
      privacyLevel: user.privacy_level,
      createdAt: user.created_at,
    },
  });
});

/**
 * GET /users/search
 * Search users by username or display name
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q: searchQuery, limit = 20 } = req.query;

  if (!searchQuery || searchQuery.trim().length < 2) {
    throw new BadRequestError('Search query must be at least 2 characters');
  }

  const searchTerm = searchQuery.trim();

  // Search by username or display name (case-insensitive)
  const result = await query(
    `SELECT id, display_name, profile_picture_url, username, bio
     FROM users
     WHERE LOWER(username) LIKE LOWER($1) OR LOWER(display_name) LIKE LOWER($1)
     ORDER BY
       CASE
         WHEN LOWER(username) = LOWER($2) THEN 1
         WHEN LOWER(display_name) = LOWER($2) THEN 2
         WHEN LOWER(username) LIKE LOWER($3) THEN 3
         WHEN LOWER(display_name) LIKE LOWER($3) THEN 4
         ELSE 5
       END,
       username ASC
     LIMIT $4`,
    [`%${searchTerm}%`, searchTerm, `${searchTerm}%`, limit]
  );

  const users = result.rows.map(user => ({
    id: user.id,
    displayName: user.display_name,
    profilePicture: user.profile_picture_url,
    username: user.username,
    bio: user.bio,
  }));

  res.json({
    success: true,
    users,
    count: users.length,
    query: searchQuery,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserById,
  searchUsers,
  upload, // Export multer middleware
};
