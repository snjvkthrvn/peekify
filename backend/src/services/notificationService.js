/**
 * Notification Service
 * Handles web push notifications via Firebase Cloud Messaging
 */

const { query } = require('../config/db');
const { sendPushNotification, sendMulticastNotification } = require('../config/firebase');
const logger = require('../utils/logger');

/**
 * Save push subscription for a user
 * @param {string} userId - User ID
 * @param {Object} subscription - Push subscription object from browser
 * @returns {Promise<Object>} Saved subscription
 */
async function saveSubscription(userId, subscription) {
  try {
    // Check if subscription already exists
    const existing = await query(
      'SELECT id FROM push_subscriptions WHERE user_id = $1 AND subscription_data = $2',
      [userId, JSON.stringify(subscription)]
    );

    if (existing.rows.length > 0) {
      logger.info('Push subscription already exists', { userId });
      return subscription;
    }

    // Save new subscription
    await query(
      'INSERT INTO push_subscriptions (user_id, subscription_data) VALUES ($1, $2)',
      [userId, JSON.stringify(subscription)]
    );

    logger.info('Push subscription saved', { userId });
    return subscription;
  } catch (error) {
    logger.error('Failed to save push subscription', {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get all subscriptions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of subscriptions
 */
async function getUserSubscriptions(userId) {
  try {
    const result = await query(
      'SELECT subscription_data FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    return result.rows.map((row) => row.subscription_data);
  } catch (error) {
    logger.error('Failed to get user subscriptions', {
      userId,
      error: error.message,
    });
    return [];
  }
}

/**
 * Delete a subscription
 * @param {string} userId - User ID
 * @param {Object} subscription - Subscription to delete
 */
async function deleteSubscription(userId, subscription) {
  try {
    await query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription_data = $2',
      [userId, JSON.stringify(subscription)]
    );

    logger.info('Push subscription deleted', { userId });
  } catch (error) {
    logger.error('Failed to delete push subscription', {
      userId,
      error: error.message,
    });
  }
}

/**
 * Send notification to a user
 * @param {string} userId - User ID
 * @param {Object} payload - Notification payload
 * @returns {Promise<number>} Number of notifications sent
 */
async function sendNotificationToUser(userId, payload) {
  try {
    const subscriptions = await getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      logger.info('No push subscriptions for user', { userId });
      return 0;
    }

    let sentCount = 0;
    for (const subscription of subscriptions) {
      const success = await sendPushNotification(subscription, payload);
      if (success) {
        sentCount++;
      }
    }

    logger.info('Notifications sent to user', { userId, count: sentCount });
    return sentCount;
  } catch (error) {
    logger.error('Failed to send notification to user', {
      userId,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Send notification to multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {Object} payload - Notification payload
 * @returns {Promise<number>} Total number of notifications sent
 */
async function sendNotificationToUsers(userIds, payload) {
  try {
    let totalSent = 0;

    for (const userId of userIds) {
      const count = await sendNotificationToUser(userId, payload);
      totalSent += count;
    }

    logger.info('Notifications sent to multiple users', {
      userCount: userIds.length,
      totalSent,
    });

    return totalSent;
  } catch (error) {
    logger.error('Failed to send notifications to users', {
      error: error.message,
    });
    return 0;
  }
}

/**
 * Send notification for new comment
 * @param {string} userId - User who should receive the notification
 * @param {Object} comment - Comment data
 */
async function notifyNewComment(userId, comment) {
  const payload = {
    title: 'New Comment',
    body: `${comment.userName} commented on your post`,
    icon: comment.userAvatar || '/icon-192.png',
    url: `/feed/${comment.feedItemId}`,
    data: {
      type: 'comment',
      commentId: comment.id,
      feedItemId: comment.feedItemId,
    },
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send notification for new reaction
 * @param {string} userId - User who should receive the notification
 * @param {Object} reaction - Reaction data
 */
async function notifyNewReaction(userId, reaction) {
  const payload = {
    title: 'New Reaction',
    body: `${reaction.userName} reacted ${reaction.emoji} to your post`,
    icon: reaction.userAvatar || '/icon-192.png',
    url: `/feed/${reaction.feedItemId}`,
    data: {
      type: 'reaction',
      reactionId: reaction.id,
      feedItemId: reaction.feedItemId,
    },
  };

  await sendNotificationToUser(userId, payload);
}

/**
 * Send daily recap notification
 * @param {string} userId - User ID
 * @param {Object} recap - Recap data
 */
async function notifyDailyRecap(userId, recap) {
  const payload = {
    title: 'Your Daily Recap is Ready! 🎵',
    body: `You listened to ${recap.totalTracks} tracks for ${recap.totalMinutes} minutes`,
    icon: recap.topTracks?.[0]?.albumImage || '/icon-192.png',
    url: `/recap/${recap.recapDate}`,
    data: {
      type: 'recap',
      recapDate: recap.recapDate,
    },
  };

  await sendNotificationToUser(userId, payload);
}

module.exports = {
  saveSubscription,
  getUserSubscriptions,
  deleteSubscription,
  sendNotificationToUser,
  sendNotificationToUsers,
  notifyNewComment,
  notifyNewReaction,
  notifyDailyRecap,
};
