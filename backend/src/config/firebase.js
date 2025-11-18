/**
 * Firebase Configuration
 * Used for Firebase Cloud Messaging (Web Push Notifications)
 * Free tier is sufficient for most use cases
 */

const admin = require('firebase-admin');
const config = require('./env');
const logger = require('../utils/logger');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  try {
    // Check if already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Initialize with service account credentials
    if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey,
        }),
      });

      logger.info('Firebase Admin SDK initialized');
    } else {
      logger.warn('Firebase credentials not configured. Push notifications will not work.');
    }

    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase', { error: error.message });
    return null;
  }
}

/**
 * Send push notification via Firebase Cloud Messaging
 * @param {Object} subscription - Push subscription object
 * @param {Object} payload - Notification payload
 * @returns {Promise<boolean>} True if notification sent successfully
 */
async function sendPushNotification(subscription, payload) {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized. Cannot send push notification.');
      return false;
    }

    const message = {
      token: subscription.token,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
      },
      data: payload.data || {},
      webpush: {
        fcmOptions: {
          link: payload.url || '/',
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info('Push notification sent', { messageId: response });
    return true;
  } catch (error) {
    logger.error('Failed to send push notification', { error: error.message });
    return false;
  }
}

/**
 * Send push notification to multiple devices
 * @param {Array} tokens - Array of FCM tokens
 * @param {Object} payload - Notification payload
 * @returns {Promise<Object>} Response with success and failure counts
 */
async function sendMulticastNotification(tokens, payload) {
  try {
    if (!firebaseApp) {
      logger.warn('Firebase not initialized. Cannot send push notifications.');
      return { successCount: 0, failureCount: tokens.length };
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
      },
      data: payload.data || {},
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    logger.info('Multicast notification sent', {
      success: response.successCount,
      failure: response.failureCount,
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    logger.error('Failed to send multicast notification', { error: error.message });
    return { successCount: 0, failureCount: tokens.length };
  }
}

/**
 * Test Firebase connection
 * @returns {Promise<boolean>} True if Firebase is properly configured
 */
async function testConnection() {
  try {
    if (!firebaseApp) {
      const app = initializeFirebase();
      if (!app) {
        logger.error('Firebase connection test failed: Not initialized');
        return false;
      }
    }

    // Test by checking if we can access messaging
    admin.messaging();
    logger.info('Firebase connection successful');
    return true;
  } catch (error) {
    logger.error('Firebase connection test failed', { error: error.message });
    return false;
  }
}

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendMulticastNotification,
  testConnection,
  vapidKey: config.firebase.vapidKey,
};
