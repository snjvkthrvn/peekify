/**
 * Feed Controller
 * Handles feed items, comments, and reactions
 */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { emitFeedUpdate, emitNewComment, emitNewReaction } = require('../services/websocket');
const { notifyNewComment, notifyNewReaction } = require('../services/notificationService');
const { asyncHandler, BadRequestError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * GET /feed
 * Get feed items (global or user-specific)
 */
const getFeed = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, userId } = req.query;

  let feedQuery;
  let params;

  if (userId) {
    // Get feed for specific user
    feedQuery = `
      SELECT
        f.id,
        f.user_id,
        f.type,
        f.content,
        f.created_at,
        u.display_name,
        u.profile_picture_url,
        (SELECT COUNT(*) FROM comments WHERE feed_item_id = f.id) as comment_count,
        (SELECT COUNT(*) FROM reactions WHERE feed_item_id = f.id) as reaction_count
      FROM feed_items f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [userId, limit, offset];
  } else {
    // Get global feed
    feedQuery = `
      SELECT
        f.id,
        f.user_id,
        f.type,
        f.content,
        f.created_at,
        u.display_name,
        u.profile_picture_url,
        (SELECT COUNT(*) FROM comments WHERE feed_item_id = f.id) as comment_count,
        (SELECT COUNT(*) FROM reactions WHERE feed_item_id = f.id) as reaction_count
      FROM feed_items f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    params = [limit, offset];
  }

  const result = await query(feedQuery, params);

  const feedItems = result.rows.map((item) => ({
    id: item.id,
    userId: item.user_id,
    type: item.type,
    content: item.content,
    createdAt: item.created_at,
    user: {
      displayName: item.display_name,
      profilePicture: item.profile_picture_url,
    },
    stats: {
      comments: parseInt(item.comment_count),
      reactions: parseInt(item.reaction_count),
    },
  }));

  res.json({
    success: true,
    feedItems,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      count: feedItems.length,
    },
  });
});

/**
 * POST /feed
 * Create a new feed item
 */
const createFeedItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, content } = req.body;

  if (!type || !content) {
    throw new BadRequestError('Type and content are required');
  }

  const feedItemId = uuidv4();

  await query(
    'INSERT INTO feed_items (id, user_id, type, content) VALUES ($1, $2, $3, $4)',
    [feedItemId, userId, type, JSON.stringify(content)]
  );

  // Get created feed item with user data
  const result = await query(
    `SELECT
      f.id,
      f.user_id,
      f.type,
      f.content,
      f.created_at,
      u.display_name,
      u.profile_picture_url
    FROM feed_items f
    JOIN users u ON f.user_id = u.id
    WHERE f.id = $1`,
    [feedItemId]
  );

  const feedItem = result.rows[0];

  // Emit WebSocket event
  emitFeedUpdate(userId, {
    id: feedItem.id,
    userId: feedItem.user_id,
    type: feedItem.type,
    content: feedItem.content,
    createdAt: feedItem.created_at,
    user: {
      displayName: feedItem.display_name,
      profilePicture: feedItem.profile_picture_url,
    },
  });

  logger.info('Feed item created', { userId, feedItemId });

  res.status(201).json({
    success: true,
    feedItem: {
      id: feedItem.id,
      userId: feedItem.user_id,
      type: feedItem.type,
      content: feedItem.content,
      createdAt: feedItem.created_at,
      user: {
        displayName: feedItem.display_name,
        profilePicture: feedItem.profile_picture_url,
      },
    },
  });
});

/**
 * GET /feed/:feedItemId/comments
 * Get comments for a feed item
 */
const getComments = asyncHandler(async (req, res) => {
  const { feedItemId } = req.params;

  const result = await query(
    `SELECT
      c.id,
      c.content,
      c.created_at,
      c.user_id,
      u.display_name,
      u.profile_picture_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.feed_item_id = $1
    ORDER BY c.created_at ASC`,
    [feedItemId]
  );

  const comments = result.rows.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at,
    userId: comment.user_id,
    user: {
      displayName: comment.display_name,
      profilePicture: comment.profile_picture_url,
    },
  }));

  res.json({
    success: true,
    comments,
  });
});

/**
 * POST /feed/:feedItemId/comments
 * Add a comment to a feed item
 */
const addComment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { feedItemId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    throw new BadRequestError('Comment content is required');
  }

  // Check if feed item exists and get owner
  const feedResult = await query(
    'SELECT user_id FROM feed_items WHERE id = $1',
    [feedItemId]
  );

  if (feedResult.rows.length === 0) {
    throw new NotFoundError('Feed item not found');
  }

  const feedOwnerId = feedResult.rows[0].user_id;

  const commentId = uuidv4();

  await query(
    'INSERT INTO comments (id, feed_item_id, user_id, content) VALUES ($1, $2, $3, $4)',
    [commentId, feedItemId, userId, content]
  );

  // Get created comment with user data
  const result = await query(
    `SELECT
      c.id,
      c.content,
      c.created_at,
      c.user_id,
      u.display_name,
      u.profile_picture_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = $1`,
    [commentId]
  );

  const comment = result.rows[0];

  // Emit WebSocket event
  emitNewComment(feedItemId, {
    id: comment.id,
    content: comment.content,
    createdAt: comment.created_at,
    userId: comment.user_id,
    user: {
      displayName: comment.display_name,
      profilePicture: comment.profile_picture_url,
    },
  });

  // Send push notification to feed owner (if not commenting on own post)
  if (feedOwnerId !== userId) {
    await notifyNewComment(feedOwnerId, {
      id: comment.id,
      feedItemId,
      userName: comment.display_name,
      userAvatar: comment.profile_picture_url,
    });
  }

  logger.info('Comment added', { userId, feedItemId, commentId });

  res.status(201).json({
    success: true,
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      userId: comment.user_id,
      user: {
        displayName: comment.display_name,
        profilePicture: comment.profile_picture_url,
      },
    },
  });
});

/**
 * POST /feed/:feedItemId/reactions
 * Add a reaction to a feed item
 */
const addReaction = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { feedItemId } = req.params;
  const { emoji } = req.body;

  if (!emoji) {
    throw new BadRequestError('Emoji is required');
  }

  // Check if feed item exists and get owner
  const feedResult = await query(
    'SELECT user_id FROM feed_items WHERE id = $1',
    [feedItemId]
  );

  if (feedResult.rows.length === 0) {
    throw new NotFoundError('Feed item not found');
  }

  const feedOwnerId = feedResult.rows[0].user_id;

  const reactionId = uuidv4();

  try {
    await query(
      'INSERT INTO reactions (id, feed_item_id, user_id, emoji) VALUES ($1, $2, $3, $4)',
      [reactionId, feedItemId, userId, emoji]
    );
  } catch (error) {
    // Handle unique constraint violation (user already reacted with this emoji)
    if (error.code === '23505') {
      throw new BadRequestError('You already reacted with this emoji');
    }
    throw error;
  }

  // Get user data
  const userResult = await query(
    'SELECT display_name, profile_picture_url FROM users WHERE id = $1',
    [userId]
  );

  const user = userResult.rows[0];

  // Emit WebSocket event
  emitNewReaction(feedItemId, {
    id: reactionId,
    emoji,
    userId,
    user: {
      displayName: user.display_name,
      profilePicture: user.profile_picture_url,
    },
  });

  // Send push notification to feed owner (if not reacting to own post)
  if (feedOwnerId !== userId) {
    await notifyNewReaction(feedOwnerId, {
      id: reactionId,
      feedItemId,
      emoji,
      userName: user.display_name,
      userAvatar: user.profile_picture_url,
    });
  }

  logger.info('Reaction added', { userId, feedItemId, emoji });

  res.status(201).json({
    success: true,
    reaction: {
      id: reactionId,
      emoji,
      userId,
    },
  });
});

module.exports = {
  getFeed,
  createFeedItem,
  getComments,
  addComment,
  addReaction,
};
