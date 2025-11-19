/**
 * Feed Controller
 * Handles feed items, comments, and reactions
 */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');
const { emitFeedUpdate, emitNewComment, emitNewReaction } = require('../services/websocket');
const { notifyNewComment, notifyNewReaction } = require('../services/notificationService');
const { asyncHandler, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
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

/**
 * DELETE /comments/:id
 * Delete a comment (only owner can delete)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: commentId } = req.params;

  if (!commentId) {
    throw new BadRequestError('Comment ID is required');
  }

  // Check if comment exists and user is owner
  const commentResult = await query(
    'SELECT id, user_id, feed_item_id FROM comments WHERE id = $1',
    [commentId]
  );

  if (commentResult.rows.length === 0) {
    throw new NotFoundError('Comment not found');
  }

  const comment = commentResult.rows[0];

  // Only comment owner can delete
  if (comment.user_id !== userId) {
    throw new ForbiddenError('You can only delete your own comments');
  }

  // Delete the comment (CASCADE will delete likes)
  await query('DELETE FROM comments WHERE id = $1', [commentId]);

  logger.info('Comment deleted', { commentId, userId });

  res.json({
    success: true,
    message: 'Comment deleted',
  });
});

/**
 * POST /comments/:id/like
 * Toggle like on a comment
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: commentId } = req.params;

  if (!commentId) {
    throw new BadRequestError('Comment ID is required');
  }

  // Check if comment exists
  const commentResult = await query(
    'SELECT id, user_id FROM comments WHERE id = $1',
    [commentId]
  );

  if (commentResult.rows.length === 0) {
    throw new NotFoundError('Comment not found');
  }

  const comment = commentResult.rows[0];

  // Check if user already liked this comment
  const existingLike = await query(
    'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
    [commentId, userId]
  );

  let liked = false;

  if (existingLike.rows.length > 0) {
    // Unlike: remove the like
    await query(
      'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );
    liked = false;
    logger.info('Comment unliked', { commentId, userId });
  } else {
    // Like: add the like
    await query(
      'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)',
      [commentId, userId]
    );
    liked = true;
    logger.info('Comment liked', { commentId, userId });
  }

  // Get updated like count
  const likeCountResult = await query(
    'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1',
    [commentId]
  );
  const likeCount = parseInt(likeCountResult.rows[0].count);

  res.json({
    success: true,
    liked,
    likeCount,
  });
});

/**
 * GET /comments/:id/likes
 * Get list of users who liked a comment
 */
const getCommentLikes = asyncHandler(async (req, res) => {
  const { id: commentId } = req.params;

  if (!commentId) {
    throw new BadRequestError('Comment ID is required');
  }

  // Check if comment exists
  const commentResult = await query(
    'SELECT id FROM comments WHERE id = $1',
    [commentId]
  );

  if (commentResult.rows.length === 0) {
    throw new NotFoundError('Comment not found');
  }

  // Get all users who liked this comment
  const result = await query(
    `SELECT
      u.id,
      u.display_name,
      u.profile_picture_url,
      u.username,
      cl.created_at
    FROM comment_likes cl
    JOIN users u ON cl.user_id = u.id
    WHERE cl.comment_id = $1
    ORDER BY cl.created_at DESC`,
    [commentId]
  );

  const likes = result.rows.map(row => ({
    userId: row.id,
    displayName: row.display_name,
    profilePicture: row.profile_picture_url,
    username: row.username,
    likedAt: row.created_at,
  }));

  res.json({
    success: true,
    likes,
    count: likes.length,
  });
});

/**
 * DELETE /feed/:feedItemId/reactions
 * Remove user's reaction from a feed item
 */
const removeReaction = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { feedItemId } = req.params;

  if (!feedItemId) {
    throw new BadRequestError('Feed item ID is required');
  }

  // Check if feed item exists
  const feedItemResult = await query(
    'SELECT id FROM feed_items WHERE id = $1',
    [feedItemId]
  );

  if (feedItemResult.rows.length === 0) {
    throw new NotFoundError('Feed item not found');
  }

  // Check if reaction exists
  const existingReaction = await query(
    'SELECT id FROM reactions WHERE feed_item_id = $1 AND user_id = $2',
    [feedItemId, userId]
  );

  if (existingReaction.rows.length === 0) {
    throw new NotFoundError('No reaction found to remove');
  }

  // Remove the reaction
  await query(
    'DELETE FROM reactions WHERE feed_item_id = $1 AND user_id = $2',
    [feedItemId, userId]
  );

  logger.info('Reaction removed', { feedItemId, userId });

  res.json({
    success: true,
    message: 'Reaction removed',
  });
});

/**
 * GET /feed/:feedItemId/reactions
 * Get all reactions for a feed item with user info
 */
const getReactions = asyncHandler(async (req, res) => {
  const { feedItemId } = req.params;

  if (!feedItemId) {
    throw new BadRequestError('Feed item ID is required');
  }

  // Check if feed item exists
  const feedItemResult = await query(
    'SELECT id FROM feed_items WHERE id = $1',
    [feedItemId]
  );

  if (feedItemResult.rows.length === 0) {
    throw new NotFoundError('Feed item not found');
  }

  // Get all reactions with user info
  const result = await query(
    `SELECT
      r.id,
      r.emoji,
      r.created_at,
      u.id as user_id,
      u.display_name,
      u.profile_picture_url,
      u.username
    FROM reactions r
    JOIN users u ON r.user_id = u.id
    WHERE r.feed_item_id = $1
    ORDER BY r.created_at DESC`,
    [feedItemId]
  );

  const reactions = result.rows.map(row => ({
    id: row.id,
    emoji: row.emoji,
    createdAt: row.created_at,
    user: {
      id: row.user_id,
      displayName: row.display_name,
      profilePicture: row.profile_picture_url,
      username: row.username,
    },
  }));

  // Group reactions by emoji for summary
  const reactionSummary = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    return acc;
  }, {});

  res.json({
    success: true,
    reactions,
    summary: Object.values(reactionSummary),
    totalCount: reactions.length,
  });
});

module.exports = {
  getFeed,
  createFeedItem,
  getComments,
  addComment,
  deleteComment,
  toggleCommentLike,
  getCommentLikes,
  addReaction,
  removeReaction,
  getReactions,
};
