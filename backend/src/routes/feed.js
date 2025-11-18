/**
 * Feed Routes
 * Handles feed items, comments, and reactions
 */

const express = require('express');
const router = express.Router();
const {
  getFeed,
  createFeedItem,
  getComments,
  addComment,
  addReaction,
} = require('../controllers/feedController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');
const { apiRateLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting
router.use(apiRateLimiter);

// GET /feed - Get feed items (public, optional auth)
router.get('/', optionalAuth, getFeed);

// POST /feed - Create new feed item
router.post('/', authenticate, createFeedItem);

// GET /feed/:feedItemId/comments - Get comments for feed item
router.get('/:feedItemId/comments', getComments);

// POST /feed/:feedItemId/comments - Add comment to feed item
router.post('/:feedItemId/comments', authenticate, addComment);

// POST /feed/:feedItemId/reactions - Add reaction to feed item
router.post('/:feedItemId/reactions', authenticate, addReaction);

module.exports = router;
