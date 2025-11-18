/**
 * WebSocket Service
 * Handles Socket.IO connections and real-time events
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { session } = require('../config/redis');
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: config.frontend.url,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Check if session exists
      const sessionData = await session.get(decoded.userId);

      if (!sessionData) {
        return next(new Error('Session expired'));
      }

      // Attach user data to socket
      socket.userId = decoded.userId;
      socket.user = {
        id: decoded.userId,
        displayName: sessionData.displayName,
      };

      logger.debug('WebSocket authenticated', { userId: socket.userId });
      next();
    } catch (error) {
      logger.error('WebSocket authentication failed', { error: error.message });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', { userId: socket.userId });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info('WebSocket client disconnected', { userId: socket.userId });
    });

    // Handle presence (online/offline status)
    socket.on('presence:update', (status) => {
      logger.debug('Presence updated', { userId: socket.userId, status });
      // Broadcast presence to all connected clients
      io.emit('presence:changed', {
        userId: socket.userId,
        status,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle typing indicators (for comments)
    socket.on('typing:start', (data) => {
      socket.to(`feed:${data.feedItemId}`).emit('typing:user', {
        userId: socket.userId,
        displayName: socket.user.displayName,
        feedItemId: data.feedItemId,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`feed:${data.feedItemId}`).emit('typing:stopped', {
        userId: socket.userId,
        feedItemId: data.feedItemId,
      });
    });

    // Join feed item room (for real-time updates on specific posts)
    socket.on('feed:join', (feedItemId) => {
      socket.join(`feed:${feedItemId}`);
      logger.debug('Joined feed item room', { userId: socket.userId, feedItemId });
    });

    // Leave feed item room
    socket.on('feed:leave', (feedItemId) => {
      socket.leave(`feed:${feedItemId}`);
      logger.debug('Left feed item room', { userId: socket.userId, feedItemId });
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

/**
 * Emit feed update event
 * @param {string} userId - User ID who created the feed item
 * @param {Object} feedItem - Feed item data
 */
function emitFeedUpdate(userId, feedItem) {
  if (!io) {
    logger.warn('WebSocket not initialized');
    return;
  }

  // Broadcast to all clients (they'll filter on frontend)
  io.emit('feed:update', {
    userId,
    feedItem,
    timestamp: new Date().toISOString(),
  });

  logger.debug('Feed update emitted', { userId, feedItemId: feedItem.id });
}

/**
 * Emit new comment event
 * @param {string} feedItemId - Feed item ID
 * @param {Object} comment - Comment data
 */
function emitNewComment(feedItemId, comment) {
  if (!io) {
    logger.warn('WebSocket not initialized');
    return;
  }

  // Emit to feed item room and feed owner
  io.to(`feed:${feedItemId}`).emit('comment:new', {
    feedItemId,
    comment,
    timestamp: new Date().toISOString(),
  });

  logger.debug('New comment emitted', { feedItemId, commentId: comment.id });
}

/**
 * Emit new reaction event
 * @param {string} feedItemId - Feed item ID
 * @param {Object} reaction - Reaction data
 */
function emitNewReaction(feedItemId, reaction) {
  if (!io) {
    logger.warn('WebSocket not initialized');
    return;
  }

  // Emit to feed item room
  io.to(`feed:${feedItemId}`).emit('reaction:new', {
    feedItemId,
    reaction,
    timestamp: new Date().toISOString(),
  });

  logger.debug('New reaction emitted', { feedItemId, reactionId: reaction.id });
}

/**
 * Emit notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
function emitNotification(userId, notification) {
  if (!io) {
    logger.warn('WebSocket not initialized');
    return;
  }

  // Emit to user's personal room
  io.to(`user:${userId}`).emit('notification', {
    notification,
    timestamp: new Date().toISOString(),
  });

  logger.debug('Notification emitted', { userId, type: notification.type });
}

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO server instance
 */
function getIO() {
  return io;
}

module.exports = {
  initializeWebSocket,
  emitFeedUpdate,
  emitNewComment,
  emitNewReaction,
  emitNotification,
  getIO,
};
