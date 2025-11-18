/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { session } = require('../config/redis');
const { UnauthorizedError, asyncHandler } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Authenticate user via JWT token
 * Token should be in Authorization header as "Bearer <token>"
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if session exists in Redis
    const sessionData = await session.get(decoded.userId);

    if (!sessionData) {
      throw new UnauthorizedError('Session expired. Please login again.');
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      spotifyId: sessionData.spotifyId,
      email: sessionData.email,
      displayName: sessionData.displayName,
    };

    logger.debug('User authenticated', { userId: req.user.id });
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    } else {
      throw error;
    }
  }
});

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't throw error if missing
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const sessionData = await session.get(decoded.userId);

    if (sessionData) {
      req.user = {
        id: decoded.userId,
        spotifyId: sessionData.spotifyId,
        email: sessionData.email,
        displayName: sessionData.displayName,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed', { error: error.message });
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuth,
};
