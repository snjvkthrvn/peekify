/**
 * User Routes
 * Handles user profile endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserById,
  upload,
} = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { apiRateLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting
router.use(apiRateLimiter);

// GET /users/me - Get current user profile
router.get('/me', authenticate, getProfile);

// PATCH /users/me - Update current user profile
router.patch('/me', authenticate, updateProfile);

// POST /users/me/avatar - Upload profile picture
router.post('/me/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// GET /users/:userId - Get public user profile
router.get('/:userId', getUserById);

module.exports = router;
