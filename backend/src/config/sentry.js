/**
 * Sentry Configuration
 * Error tracking and monitoring (optional)
 * Free tier includes 5,000 errors/month
 */

const Sentry = require('@sentry/node');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * Initialize Sentry
 * @param {Object} app - Express app instance
 */
function initializeSentry(app) {
  if (!config.sentry.dsn) {
    logger.info('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.nodeEnv,
      tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,

      // Integrations
      integrations: [
        // HTTP integration for request tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Express integration
        new Sentry.Integrations.Express({ app }),
      ],

      // Don't send errors in development
      enabled: config.nodeEnv === 'production',
    });

    logger.info('Sentry initialized', { environment: config.nodeEnv });
  } catch (error) {
    logger.error('Failed to initialize Sentry', { error: error.message });
  }
}

/**
 * Sentry request handler middleware
 * Must be added BEFORE all other middleware
 */
const requestHandler = Sentry.Handlers.requestHandler();

/**
 * Sentry tracing handler middleware
 * Must be added BEFORE all routes
 */
const tracingHandler = Sentry.Handlers.tracingHandler();

/**
 * Sentry error handler middleware
 * Must be added AFTER all routes but BEFORE other error handlers
 */
const errorHandler = Sentry.Handlers.errorHandler();

/**
 * Capture exception manually
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
function captureException(error, context = {}) {
  if (config.sentry.dsn) {
    Sentry.captureException(error, { extra: context });
  }
  logger.error('Exception captured', { error: error.message, context });
}

/**
 * Capture message manually
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (info, warning, error)
 */
function captureMessage(message, level = 'info') {
  if (config.sentry.dsn) {
    Sentry.captureMessage(message, level);
  }
  logger.info('Message captured', { message, level });
}

module.exports = {
  initializeSentry,
  requestHandler,
  tracingHandler,
  errorHandler,
  captureException,
  captureMessage,
  Sentry,
};
