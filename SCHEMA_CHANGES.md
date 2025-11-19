# Database Schema Changes - November 2024

## Summary

Updated database schema to support profile functionality and friends system that the frontend expects.

## Changes Made

### Users Table - Added 5 Columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `username` | VARCHAR(50) | NULL | Unique username for profile URLs |
| `bio` | TEXT | NULL | User biography/description |
| `privacy_level` | VARCHAR(20) | 'public' | Privacy setting: 'private', 'friends', 'public' |
| `timezone` | VARCHAR(100) | 'UTC' | User's timezone for notifications |
| `notification_time` | TIME | '21:30' | Preferred time for daily reveal (9:30 PM) |

**Constraints:**
- `username` must be unique
- `privacy_level` must be one of: 'private', 'friends', 'public'

**Indexes:**
- `idx_users_username` - Fast username lookups
- `idx_users_spotify_id` - Fast Spotify ID lookups

### New Tables

#### comment_likes
Tracks which users liked which comments.

```sql
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  UNIQUE(comment_id, user_id)
);
```

**Indexes:**
- `idx_comment_likes_comment_id`
- `idx_comment_likes_user_id`

#### friends
Stores established friendships between users.

```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);
```

**Indexes:**
- `idx_friends_user_id`
- `idx_friends_friend_id`

**Note:** Friendship is directional. To check if two users are friends, query both directions.

#### friend_requests
Manages pending, accepted, and declined friend requests.

```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id),
  CHECK (status IN ('pending', 'accepted', 'declined'))
);
```

**Indexes:**
- `idx_friend_requests_sender_id`
- `idx_friend_requests_receiver_id`
- `idx_friend_requests_status`

**Trigger:** `update_friend_requests_updated_at` - Auto-updates `updated_at` on changes

## Migration Instructions

### For Existing Databases

Run the migration script:

```bash
psql $DATABASE_URL -f backend/migrations/001_add_user_profile_columns.sql
```

**Or** copy and paste the contents into Neon SQL Editor.

### For New Installations

The updated `backend/schema.sql` already includes all these changes. Simply run:

```bash
psql $DATABASE_URL -f backend/schema.sql
```

## Backward Compatibility

✅ **Fully backward compatible**

- Existing users will have `username = NULL` (can be set via profile settings)
- Existing users will have `privacy_level = 'public'` (default)
- All new columns are nullable or have defaults
- No existing data will be lost or modified

## Frontend Impact

These schema changes fix the following frontend issues:

### Now Working
- ✅ Profile pages by username (once username is set)
- ✅ User bio display and editing
- ✅ Privacy settings (private/friends/public)
- ✅ Timezone-aware notifications
- ✅ Custom notification time settings

### Ready for Implementation
- ✅ Comment liking system (table exists, needs API endpoints)
- ✅ Friends system (tables exist, needs API endpoints)
- ✅ Friend requests (tables exist, needs API endpoints)

## Required Backend Work

While the database schema is now complete, you still need to implement:

### Priority 1: Friends System API
Create `backend/src/routes/friends.js` and `backend/src/controllers/friendsController.js`

**Required endpoints:**
- `POST /friends/request` - Send friend request
- `POST /friends/accept` - Accept friend request
- `POST /friends/decline` - Decline friend request
- `DELETE /friends/:friendId` - Remove friend
- `GET /friends` - Get friends list
- `GET /friends/requests` - Get pending requests
- `GET /users/search?q=` - Search users by username

### Priority 2: Comment Likes API
Add to `backend/src/controllers/feedController.js`:

**Required endpoints:**
- `POST /comments/:commentId/like` - Toggle like on comment
- `GET /comments/:commentId/likes` - Get likes for comment

### Priority 3: Reaction Management
Add to `backend/src/controllers/feedController.js`:

**Required endpoints:**
- `DELETE /feed/:feedItemId/reactions` - Remove reaction
- `GET /feed/:feedItemId/reactions` - Get all reactions

### Priority 4: User Profile by Username
Add to `backend/src/routes/user.js`:

**Required endpoint:**
- `GET /users/username/:username` - Get user by username (in addition to by ID)

## Data Validation

### At Application Level

When implementing the API endpoints, ensure:

```javascript
// Username validation
const isValidUsername = (username) => {
  return /^[a-zA-Z0-9_]{3,50}$/.test(username);
};

// Privacy level validation
const validPrivacyLevels = ['private', 'friends', 'public'];

// Timezone validation
const isValidTimezone = (tz) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// Notification time validation (HH:MM format)
const isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};
```

## Testing

### Test the Migration

```sql
-- Check users table has new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users';

-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('comment_likes', 'friends', 'friend_requests');

-- Check indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('users', 'friends', 'friend_requests', 'comment_likes');
```

### Test Data

```sql
-- Set username for a user
UPDATE users
SET username = 'testuser', bio = 'Test bio'
WHERE email = 'test@example.com';

-- Create a friend request
INSERT INTO friend_requests (sender_id, receiver_id)
VALUES (
  (SELECT id FROM users WHERE email = 'user1@example.com'),
  (SELECT id FROM users WHERE email = 'user2@example.com')
);

-- Accept friend request and create friendship
UPDATE friend_requests
SET status = 'accepted'
WHERE sender_id = ... AND receiver_id = ...;

INSERT INTO friends (user_id, friend_id) VALUES (..., ...);
INSERT INTO friends (user_id, friend_id) VALUES (..., ...); -- bidirectional
```

## Monitoring

After migration, monitor:
- Username uniqueness violations
- Privacy level constraint violations
- Friend request logic (prevent self-friending)
- Performance of username lookups (should use index)

## Rollback Plan

If you need to rollback (not recommended):

```sql
-- Remove new tables
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

-- Remove new columns from users
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS privacy_level;
ALTER TABLE users DROP COLUMN IF EXISTS timezone;
ALTER TABLE users DROP COLUMN IF EXISTS notification_time;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_spotify_id;
```

**⚠️ Warning:** This will delete all usernames, bios, friendships, and friend requests!

## Questions & Support

For issues with the schema:
1. Check `backend/migrations/README.md` for troubleshooting
2. Review the SQL syntax in `backend/schema.sql`
3. Test on a development database first

## Next Steps

1. ✅ Run migration on development database
2. ✅ Test schema changes
3. ⏳ Implement friends system API endpoints
4. ⏳ Implement comment likes API endpoints
5. ⏳ Implement user search by username
6. ⏳ Update user profile API to handle new fields
7. ⏳ Run migration on production database

---

**Schema Version:** 001
**Last Updated:** 2024-11-19
**Status:** Ready for API implementation
