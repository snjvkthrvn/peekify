/**
 * Daily Recap Job
 * Runs daily at 9:30 PM to generate listening recaps
 * Uses node-cron for scheduling
 */

const cron = require('node-cron');
const { query } = require('../config/db');
const { generateDailyRecap, generateRecapSummary } = require('../services/recapService');
const { notifyDailyRecap } = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Process daily recap for a single user
 * @param {string} userId - User ID
 */
async function processUserRecap(userId) {
  try {
    // Generate recap for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recap = await generateDailyRecap(userId, yesterday);

    if (!recap) {
      logger.debug('No listening data for user', { userId });
      return;
    }

    // Send push notification
    await notifyDailyRecap(userId, recap);

    logger.info('Daily recap processed', { userId, date: recap.recapDate });
  } catch (error) {
    logger.error('Failed to process daily recap', {
      userId,
      error: error.message,
    });
  }
}

/**
 * Run daily recap job for all users
 */
async function runDailyRecap() {
  try {
    logger.info('Starting daily recap job');

    // Get all users
    const result = await query('SELECT id FROM users');
    const users = result.rows;

    logger.info(`Processing recaps for ${users.length} users`);

    // Process recaps in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      // Process batch in parallel
      await Promise.all(
        batch.map((user) => processUserRecap(user.id))
      );

      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    logger.info('Daily recap job completed', { totalUsers: users.length });
  } catch (error) {
    logger.error('Daily recap job failed', { error: error.message });
  }
}

/**
 * Initialize daily recap cron job
 * Runs every day at 9:30 PM (21:30)
 */
function initializeDailyRecapJob() {
  // Schedule: At 9:30 PM every day
  // Format: minute hour day month weekday
  const schedule = '30 21 * * *';

  cron.schedule(schedule, async () => {
    logger.info('Daily recap cron job triggered');
    await runDailyRecap();
  }, {
    timezone: 'UTC', // Use UTC timezone
  });

  logger.info('Daily recap cron job scheduled', { schedule, timezone: 'UTC' });
}

/**
 * Run recap job immediately (for testing)
 */
async function runRecapNow() {
  logger.info('Running daily recap job immediately');
  await runDailyRecap();
}

module.exports = {
  initializeDailyRecapJob,
  runDailyRecap,
  runRecapNow,
};
