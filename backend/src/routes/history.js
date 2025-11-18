/**
 * History Routes
 * Handles listening history endpoints
 */

const express = require('express');
const router = express.Router();
const {
  syncHistory,
  getHistory,
  getStats,
} = require('../controllers/historyController');
const { authenticate } = require('../middlewares/authMiddleware');
const { apiRateLimiter, expensiveRateLimiter } = require('../middlewares/rateLimit');

// GET /history - Get listening history (with caching)
router.get('/', authenticate, apiRateLimiter, getHistory);

// POST /history/sync - Sync from Spotify (expensive operation)
router.post('/sync', authenticate, expensiveRateLimiter, syncHistory);

// GET /history/stats - Get listening statistics
router.get('/stats', authenticate, apiRateLimiter, getStats);

module.exports = router;
