/**
 * Notifications Controller
 * Handles web push notification subscriptions and sending
 */

const {
  saveSubscription,
  getUserSubscriptions,
  deleteSubscription,
  sendNotificationToUser,
} = require('../services/notificationService');
const { asyncHandler, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * POST /notifications/subscribe
 * Save push notification subscription
 */
const subscribe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { subscription } = req.body;

  if (!subscription) {
    throw new BadRequestError('Subscription data is required');
  }

  await saveSubscription(userId, subscription);

  logger.info('Push subscription saved', { userId });

  res.status(201).json({
    success: true,
    message: 'Subscription saved successfully',
  });
});

/**
 * POST /notifications/unsubscribe
 * Remove push notification subscription
 */
const unsubscribe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { subscription } = req.body;

  if (!subscription) {
    throw new BadRequestError('Subscription data is required');
  }

  await deleteSubscription(userId, subscription);

  logger.info('Push subscription deleted', { userId });

  res.json({
    success: true,
    message: 'Subscription removed successfully',
  });
});

/**
 * GET /notifications/subscriptions
 * Get all subscriptions for current user
 */
const getSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const subscriptions = await getUserSubscriptions(userId);

  res.json({
    success: true,
    subscriptions,
    count: subscriptions.length,
  });
});

/**
 * POST /notifications/send
 * Send a test notification (for testing purposes)
 */
const sendTestNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, body } = req.body;

  if (!title || !body) {
    throw new BadRequestError('Title and body are required');
  }

  const payload = {
    title,
    body,
    icon: '/icon-192.png',
    url: '/',
  };

  const count = await sendNotificationToUser(userId, payload);

  logger.info('Test notification sent', { userId, count });

  res.json({
    success: true,
    message: 'Test notification sent',
    sentCount: count,
  });
});

module.exports = {
  subscribe,
  unsubscribe,
  getSubscriptions,
  sendTestNotification,
};
