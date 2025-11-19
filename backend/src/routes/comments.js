/**
 * Comments Routes
 * Handles comment management (delete, likes)
 */

const express = require('express');
const router = express.Router();
const {
  deleteComment,
  toggleCommentLike,
  getCommentLikes,
} = require('../controllers/feedController');
const { authenticate } = require('../middlewares/authMiddleware');
const { apiRateLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting
router.use(apiRateLimiter);

// DELETE /comments/:id - Delete a comment (owner only)
router.delete('/:id', authenticate, deleteComment);

// POST /comments/:id/like - Toggle like on a comment
router.post('/:id/like', authenticate, toggleCommentLike);

// GET /comments/:id/likes - Get users who liked a comment
router.get('/:id/likes', getCommentLikes);

module.exports = router;
