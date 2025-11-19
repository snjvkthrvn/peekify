/**
 * Friends Routes
 * Handles friend requests and friend management
 */

const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
} = require('../controllers/friendsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { apiRateLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting to all routes
router.use(apiRateLimiter);

// All routes require authentication
router.use(authenticate);

// POST /friends/request - Send friend request
router.post('/request', sendFriendRequest);

// POST /friends/accept - Accept friend request
router.post('/accept', acceptFriendRequest);

// POST /friends/decline - Decline friend request
router.post('/decline', declineFriendRequest);

// GET /friends - Get list of friends
router.get('/', getFriends);

// GET /friends/requests - Get pending friend requests
router.get('/requests', getFriendRequests);

// DELETE /friends/:friendId - Remove friend
router.delete('/:friendId', removeFriend);

module.exports = router;
