/**
 * Server Setup
 * Configures Express app with all middleware and routes
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config/env');
const { initializeSentry, requestHandler, tracingHandler, errorHandler: sentryErrorHandler } = require('./config/sentry');
const { initializeFirebase } = require('./config/firebase');
const { initializeWebSocket } = require('./services/websocket');
const { initializeDailyRecapJob } = require('./jobs/dailyRecap');
const { errorHandler, notFoundHandler } = require('./utils/errors');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const feedRoutes = require('./routes/feed');
const historyRoutes = require('./routes/history');
const notificationsRoutes = require('./routes/notifications');
const testRoutes = require('./routes/test-routes');

/**
 * Create and configure Express app
 */
function createApp() {
  const app = express();

  // Initialize Sentry (must be first)
  initializeSentry(app);
  app.use(requestHandler);
  app.use(tracingHandler);

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS configuration
  app.use(cors({
    origin: config.frontend.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logger
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check endpoint (before routes)
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/feed', feedRoutes);
  app.use('/history', historyRoutes);
  app.use('/notifications', notificationsRoutes);
  app.use('/test', testRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Replay API - Spotify Listening History Sharing',
      version: '1.0.0',
      endpoints: {
        auth: '/auth',
        users: '/users',
        feed: '/feed',
        history: '/history',
        notifications: '/notifications',
        test: '/test',
        health: '/health',
      },
    });
  });

  // Sentry error handler (must be before other error handlers)
  app.use(sentryErrorHandler);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 * @param {Object} app - Express app instance
 * @returns {Object} HTTP server instance
 */
function startServer(app) {
  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket server
  initializeWebSocket(server);

  // Initialize Firebase
  initializeFirebase();

  // Initialize daily recap cron job
  initializeDailyRecapJob();

  // Start listening
  const port = config.port;
  server.listen(port, () => {
    logger.info(`Server started on port ${port}`, {
      environment: config.nodeEnv,
      port,
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

module.exports = {
  createApp,
  startServer,
};
