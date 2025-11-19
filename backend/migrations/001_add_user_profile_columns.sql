-- Migration: Add User Profile Columns
-- Date: 2024-11-19
-- Description: Add username, bio, privacy_level, timezone, and notification_time columns to users table
-- These columns are required for profile functionality on the frontend

-- Add username column (nullable initially for existing users)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add bio column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add privacy_level column with default 'public'
-- Options: 'private', 'friends', 'public'
ALTER TABLE users
ADD COLUMN IF NOT EXISTS privacy_level VARCHAR(20) DEFAULT 'public';

-- Add timezone column with default 'UTC'
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';

-- Add notification_time column with default '21:30' (9:30 PM)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notification_time TIME DEFAULT '21:30';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add constraint to ensure privacy_level is valid
ALTER TABLE users
ADD CONSTRAINT IF NOT EXISTS users_privacy_level_check
CHECK (privacy_level IN ('private', 'friends', 'public'));

-- Create comment_likes table (referenced in frontend but missing)
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- Create index for comment likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Create friends table (entire friends system missing)
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_id),
  -- Ensure users can't friend themselves
  CHECK (user_id != friend_id)
);

-- Create indexes for friends
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sender_id, receiver_id),
  -- Ensure users can't send requests to themselves
  CHECK (sender_id != receiver_id)
);

-- Add constraint for friend request status
ALTER TABLE friend_requests
ADD CONSTRAINT IF NOT EXISTS friend_requests_status_check
CHECK (status IN ('pending', 'accepted', 'declined'));

-- Create indexes for friend requests
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Apply updated_at trigger to friend_requests table
CREATE TRIGGER IF NOT EXISTS update_friend_requests_updated_at
BEFORE UPDATE ON friend_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration complete
-- Run this SQL file on your Neon database to add the missing columns and tables
