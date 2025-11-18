/**
 * Auth Routes
 * Handles authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { login, callback, logout, me } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authRateLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting to auth routes
router.use(authRateLimiter);

// POST /auth/login - Initiate Spotify OAuth
router.get('/login', login);

// GET /auth/callback - Handle Spotify OAuth callback
router.get('/callback', callback);

// POST /auth/logout - Logout user
router.post('/logout', authenticate, logout);

// GET /auth/me - Get current user
router.get('/me', authenticate, me);

module.exports = router;
