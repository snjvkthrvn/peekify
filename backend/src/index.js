/**
 * Main Entry Point
 * Starts the Replay backend server
 */

const { createApp, startServer } = require('./server');
const { testConnection: testDb } = require('./config/db');
const { testConnection: testRedis } = require('./config/redis');
const logger = require('./utils/logger');

/**
 * Initialize and start the application
 */
async function initialize() {
  try {
    logger.info('Initializing Replay backend...');

    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testDb();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Test Redis connection
    logger.info('Testing Redis connection...');
    const redisConnected = await testRedis();
    if (!redisConnected) {
      throw new Error('Failed to connect to Redis');
    }

    // Create Express app
    const app = createApp();

    // Start server
    startServer(app);

    logger.info('Replay backend initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason,
    promise,
  });
  process.exit(1);
});

// Start the application
initialize();
