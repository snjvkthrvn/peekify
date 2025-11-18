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
    'SELECT id, spotify_id, email, display_name, profile_picture_url, created_at FROM users WHERE id = $1',
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
  const { displayName, email } = req.body;

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

  if (updates.length === 0) {
    throw new BadRequestError('No fields to update');
  }

  values.push(userId);

  const updateQuery = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, spotify_id, email, display_name, profile_picture_url, created_at
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
    'SELECT id, display_name, profile_picture_url, created_at FROM users WHERE id = $1',
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
      createdAt: user.created_at,
    },
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserById,
  upload, // Export multer middleware
};
