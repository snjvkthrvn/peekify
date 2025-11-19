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
  getTodaysReplay,
} = require('../controllers/historyController');
const { authenticate } = require('../middlewares/authMiddleware');
const { apiRateLimiter, expensiveRateLimiter } = require('../middlewares/rateLimit');

// GET /history/today - Get today's most played song (must be before /)
router.get('/today', authenticate, apiRateLimiter, getTodaysReplay);

// GET /history/stats - Get listening statistics (must be before /)
router.get('/stats', authenticate, apiRateLimiter, getStats);

// POST /history/sync - Sync from Spotify (expensive operation)
router.post('/sync', authenticate, expensiveRateLimiter, syncHistory);

// GET /history - Get listening history (with caching)
router.get('/', authenticate, apiRateLimiter, getHistory);

module.exports = router;
