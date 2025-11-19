/**
 * Friends Controller
 * Handles friend requests and friend management
 */

const { query } = require('../config/db');
const { asyncHandler, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * POST /friends/request
 * Send a friend request
 */
const sendFriendRequest = asyncHandler(async (req, res) => {
  const senderId = req.user.id;
  const { userId: receiverId } = req.body;

  if (!receiverId) {
    throw new BadRequestError('Receiver user ID is required');
  }

  // Can't send friend request to yourself
  if (senderId === receiverId) {
    throw new BadRequestError('Cannot send friend request to yourself');
  }

  // Check if receiver exists
  const receiverCheck = await query(
    'SELECT id FROM users WHERE id = $1',
    [receiverId]
  );

  if (receiverCheck.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  // Check if already friends
  const friendCheck = await query(
    'SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2',
    [senderId, receiverId]
  );

  if (friendCheck.rows.length > 0) {
    throw new BadRequestError('Already friends with this user');
  }

  // Check if request already exists
  const existingRequest = await query(
    'SELECT id, status FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2',
    [senderId, receiverId]
  );

  if (existingRequest.rows.length > 0) {
    const status = existingRequest.rows[0].status;
    if (status === 'pending') {
      throw new BadRequestError('Friend request already sent');
    } else if (status === 'accepted') {
      throw new BadRequestError('Friend request already accepted');
    }
  }

  // Check for reverse request (receiver already sent request to sender)
  const reverseRequest = await query(
    'SELECT id, status FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2',
    [receiverId, senderId]
  );

  if (reverseRequest.rows.length > 0 && reverseRequest.rows[0].status === 'pending') {
    // Auto-accept the reverse request instead of creating a new one
    const requestId = reverseRequest.rows[0].id;

    // Update request to accepted
    await query(
      'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['accepted', requestId]
    );

    // Create bidirectional friendship
    await query(
      'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1)',
      [senderId, receiverId]
    );

    logger.info(`Auto-accepted friend request from reverse request: ${requestId}`);

    return res.json({
      success: true,
      message: 'Friend request auto-accepted (reverse request existed)',
      friendship: { userId: senderId, friendId: receiverId }
    });
  }

  // Create new friend request
  const result = await query(
    `INSERT INTO friend_requests (sender_id, receiver_id, status)
     VALUES ($1, $2, 'pending')
     RETURNING id, sender_id, receiver_id, status, created_at`,
    [senderId, receiverId]
  );

  const friendRequest = result.rows[0];

  logger.info(`Friend request sent: ${friendRequest.id}`);

  res.json({
    success: true,
    friendRequest: {
      id: friendRequest.id,
      senderId: friendRequest.sender_id,
      receiverId: friendRequest.receiver_id,
      status: friendRequest.status,
      createdAt: friendRequest.created_at,
    },
  });
});

/**
 * POST /friends/accept
 * Accept a friend request
 */
const acceptFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.body;

  if (!requestId) {
    throw new BadRequestError('Request ID is required');
  }

  // Get the friend request
  const result = await query(
    'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = $1',
    [requestId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Friend request not found');
  }

  const friendRequest = result.rows[0];

  // Only the receiver can accept
  if (friendRequest.receiver_id !== userId) {
    throw new ForbiddenError('You can only accept requests sent to you');
  }

  // Check if already accepted
  if (friendRequest.status === 'accepted') {
    throw new BadRequestError('Friend request already accepted');
  }

  // Check if declined
  if (friendRequest.status === 'declined') {
    throw new BadRequestError('Cannot accept a declined friend request');
  }

  // Update request status to accepted
  await query(
    'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    ['accepted', requestId]
  );

  // Create bidirectional friendship
  const senderId = friendRequest.sender_id;
  const receiverId = friendRequest.receiver_id;

  await query(
    'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1) ON CONFLICT DO NOTHING',
    [senderId, receiverId]
  );

  logger.info(`Friend request accepted: ${requestId}`);

  res.json({
    success: true,
    message: 'Friend request accepted',
    friendship: {
      userId: receiverId,
      friendId: senderId,
    },
  });
});

/**
 * POST /friends/decline
 * Decline a friend request
 */
const declineFriendRequest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.body;

  if (!requestId) {
    throw new BadRequestError('Request ID is required');
  }

  // Get the friend request
  const result = await query(
    'SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = $1',
    [requestId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Friend request not found');
  }

  const friendRequest = result.rows[0];

  // Only the receiver can decline
  if (friendRequest.receiver_id !== userId) {
    throw new ForbiddenError('You can only decline requests sent to you');
  }

  // Check if already declined
  if (friendRequest.status === 'declined') {
    throw new BadRequestError('Friend request already declined');
  }

  // Check if already accepted
  if (friendRequest.status === 'accepted') {
    throw new BadRequestError('Cannot decline an accepted friend request');
  }

  // Update request status to declined
  await query(
    'UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    ['declined', requestId]
  );

  logger.info(`Friend request declined: ${requestId}`);

  res.json({
    success: true,
    message: 'Friend request declined',
  });
});

/**
 * DELETE /friends/:friendId
 * Remove a friend
 */
const removeFriend = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.params;

  if (!friendId) {
    throw new BadRequestError('Friend ID is required');
  }

  // Check if friendship exists
  const result = await query(
    'SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2',
    [userId, friendId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Friendship not found');
  }

  // Remove bidirectional friendship
  await query(
    'DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
    [userId, friendId]
  );

  logger.info(`Friendship removed between ${userId} and ${friendId}`);

  res.json({
    success: true,
    message: 'Friend removed',
  });
});

/**
 * GET /friends
 * Get list of friends
 */
const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(
    `SELECT
      u.id,
      u.spotify_id,
      u.display_name,
      u.profile_picture_url,
      u.username,
      u.bio,
      f.created_at as friendship_since
    FROM friends f
    JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC`,
    [userId]
  );

  const friends = result.rows.map(row => ({
    id: row.id,
    spotifyId: row.spotify_id,
    displayName: row.display_name,
    profilePictureUrl: row.profile_picture_url,
    username: row.username,
    bio: row.bio,
    friendshipSince: row.friendship_since,
  }));

  res.json({
    success: true,
    friends,
    count: friends.length,
  });
});

/**
 * GET /friends/requests
 * Get pending friend requests (received and sent)
 */
const getFriendRequests = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query; // 'received', 'sent', or undefined for both

  let receivedRequests = [];
  let sentRequests = [];

  // Get received requests (pending only)
  if (!type || type === 'received') {
    const receivedResult = await query(
      `SELECT
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.status,
        fr.created_at,
        u.display_name,
        u.profile_picture_url,
        u.username,
        u.bio
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC`,
      [userId]
    );

    receivedRequests = receivedResult.rows.map(row => ({
      id: row.id,
      type: 'received',
      status: row.status,
      createdAt: row.created_at,
      sender: {
        id: row.sender_id,
        displayName: row.display_name,
        profilePictureUrl: row.profile_picture_url,
        username: row.username,
        bio: row.bio,
      },
    }));
  }

  // Get sent requests (pending only)
  if (!type || type === 'sent') {
    const sentResult = await query(
      `SELECT
        fr.id,
        fr.sender_id,
        fr.receiver_id,
        fr.status,
        fr.created_at,
        u.display_name,
        u.profile_picture_url,
        u.username,
        u.bio
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = $1 AND fr.status = 'pending'
      ORDER BY fr.created_at DESC`,
      [userId]
    );

    sentRequests = sentResult.rows.map(row => ({
      id: row.id,
      type: 'sent',
      status: row.status,
      createdAt: row.created_at,
      receiver: {
        id: row.receiver_id,
        displayName: row.display_name,
        profilePictureUrl: row.profile_picture_url,
        username: row.username,
        bio: row.bio,
      },
    }));
  }

  res.json({
    success: true,
    requests: {
      received: receivedRequests,
      sent: sentRequests,
    },
    count: {
      received: receivedRequests.length,
      sent: sentRequests.length,
      total: receivedRequests.length + sentRequests.length,
    },
  });
});

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
};
