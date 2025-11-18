/**
 * Notifications Routes
 * Handles web push notification endpoints
 */

const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscriptions,
  sendTestNotification,
} = require('../controllers/notificationsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { apiRateLimiter } = require('../middlewares/rateLimit');

// Apply rate limiting
router.use(apiRateLimiter);

// POST /notifications/subscribe - Save push subscription
router.post('/subscribe', authenticate, subscribe);

// POST /notifications/unsubscribe - Remove push subscription
router.post('/unsubscribe', authenticate, unsubscribe);

// GET /notifications/subscriptions - Get all subscriptions
router.get('/subscriptions', authenticate, getSubscriptions);

// POST /notifications/send - Send test notification
router.post('/send', authenticate, sendTestNotification);

module.exports = router;
