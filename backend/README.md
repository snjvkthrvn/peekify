# Replay Backend

Backend API for Replay - A Spotify listening history sharing application.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Neon PostgreSQL (free tier)
- **Cache/Sessions**: Upstash Redis (free tier)
- **Storage**: Supabase Storage (free tier, no credit card)
- **Push Notifications**: Firebase Cloud Messaging (web push)
- **Job Scheduling**: node-cron
- **Authentication**: JWT + Spotify OAuth
- **Monitoring**: Sentry (optional, free tier)

## Features

- ✅ Spotify OAuth authentication
- ✅ User profile management with avatar uploads
- ✅ Listening history tracking and sync
- ✅ Social feed with comments and reactions
- ✅ Real-time updates via WebSocket (Socket.IO)
- ✅ Web push notifications
- ✅ Daily listening recaps
- ✅ Redis caching for performance
- ✅ Rate limiting
- ✅ Comprehensive error handling

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.js       # Environment variables
│   │   ├── db.js        # PostgreSQL connection
│   │   ├── redis.js     # Redis connection
│   │   ├── spotify.js   # Spotify API config
│   │   ├── supabase.js  # Supabase Storage config
│   │   ├── firebase.js  # Firebase FCM config
│   │   └── sentry.js    # Sentry error tracking
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── feedController.js
│   │   ├── historyController.js
│   │   └── notificationsController.js
│   ├── middlewares/     # Express middleware
│   │   ├── authMiddleware.js
│   │   └── rateLimit.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── feed.js
│   │   ├── history.js
│   │   ├── notifications.js
│   │   └── test-routes.js
│   ├── services/        # Business logic
│   │   ├── spotifyService.js
│   │   ├── recapService.js
│   │   ├── notificationService.js
│   │   └── websocket.js
│   ├── jobs/            # Cron jobs
│   │   └── dailyRecap.js
│   ├── utils/           # Utilities
│   │   ├── errors.js
│   │   └── logger.js
│   ├── server.js        # Express app setup
│   └── index.js         # Entry point
├── schema.sql           # Database schema
├── package.json
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Accounts created for:
  - Neon (PostgreSQL database)
  - Upstash (Redis)
  - Supabase (Storage)
  - Spotify Developer
  - Firebase (optional, for push notifications)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in the environment variables:

#### Spotify OAuth

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/auth/callback` (for local dev)
4. Copy Client ID and Client Secret to `.env`

#### Neon PostgreSQL

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string (should start with `postgresql://`)
4. Paste into `DATABASE_URL` in `.env`

#### Upstash Redis

1. Sign up at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the Redis URL (should start with `rediss://`)
4. Paste into `REDIS_URL` in `.env`

#### Supabase Storage

1. Sign up at [Supabase](https://supabase.com) (no credit card required)
2. Create a new project
3. Go to Storage → Create a new bucket named `avatars`
4. Make the bucket **public**
5. Copy Project URL and Service Role Key from Settings → API
6. Paste into `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_BUCKET=avatars`

#### Firebase Cloud Messaging (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Copy the JSON content and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n`)
6. Go to Cloud Messaging → Web Push certificates
7. Generate a new key pair
8. Copy the key → `FIREBASE_VAPID_KEY`

#### JWT Secret

Generate a random secret for JWT:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `JWT_SECRET` in `.env`.

### 3. Set Up Database

Run the SQL schema to create tables:

```bash
# Using psql
psql <your-database-url> -f schema.sql

# Or copy the contents of schema.sql and run in Neon's SQL Editor
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

### 5. Test the Setup

Visit these endpoints to verify everything is working:

- **Health check**: http://localhost:3000/health
- **Test all services**: http://localhost:3000/test/all
- **Test database**: http://localhost:3000/test/db
- **Test Redis**: http://localhost:3000/test/redis
- **Test Spotify**: http://localhost:3000/test/spotify

## API Endpoints

### Authentication

- `GET /auth/login` - Initiate Spotify OAuth
- `GET /auth/callback` - OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Users

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `POST /users/me/avatar` - Upload profile picture
- `GET /users/:userId` - Get public user profile

### Feed

- `GET /feed` - Get feed items
- `POST /feed` - Create feed item
- `GET /feed/:id/comments` - Get comments
- `POST /feed/:id/comments` - Add comment
- `POST /feed/:id/reactions` - Add reaction

### Listening History

- `GET /history` - Get listening history
- `POST /history/sync` - Sync from Spotify
- `GET /history/stats` - Get statistics

### Notifications

- `POST /notifications/subscribe` - Subscribe to push notifications
- `POST /notifications/unsubscribe` - Unsubscribe
- `GET /notifications/subscriptions` - Get subscriptions
- `POST /notifications/send` - Send test notification

### Test Routes

- `GET /test` - Health check
- `GET /test/all` - Test all services
- `GET /test/db` - Test database
- `GET /test/redis` - Test Redis
- `GET /test/spotify` - Test Spotify config
- `GET /test/firebase` - Test Firebase config

## Deployment to Render

### 1. Prepare for Deployment

Update `.env` variables for production:

```env
NODE_ENV=production
SPOTIFY_REDIRECT_URI=https://your-app.onrender.com/auth/callback
FRONTEND_URL=https://your-frontend.vercel.app
WS_URL=wss://your-app.onrender.com
```

### 2. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: replay-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Add Environment Variables

In Render dashboard, go to Environment and add all variables from `.env`:

- `PORT` (usually auto-set by Render)
- `NODE_ENV=production`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_VAPID_KEY`
- `FRONTEND_URL`

### 4. Update Spotify Redirect URI

1. Go to Spotify Developer Dashboard
2. Edit your app
3. Add production redirect URI: `https://your-app.onrender.com/auth/callback`

### 5. Deploy

Click "Create Web Service" and Render will automatically deploy your app.

## WebSocket Connection

The WebSocket server runs on the same port as the HTTP server.

**Connect from frontend**:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: yourJwtToken
  }
});

// Listen for events
socket.on('feed:update', (data) => {
  console.log('New feed item:', data);
});

socket.on('comment:new', (data) => {
  console.log('New comment:', data);
});
```

## Cron Jobs

### Daily Recap Job

Runs every day at 9:30 PM UTC:

- Generates listening recap for previous day
- Sends push notification to users
- Processes users in batches to avoid overload

## Error Handling

The app uses custom error classes for consistent error handling:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ValidationError` (422)
- `RateLimitError` (429)
- `InternalServerError` (500)

All errors are logged and returned in a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error message here"
  }
}
```

## Rate Limiting

Three rate limit tiers:

1. **Auth endpoints**: 5 requests per 15 minutes
2. **Standard API**: 100 requests per minute
3. **Expensive operations**: 10 requests per minute

## Logging

Uses Winston for structured logging:

- **Development**: Colorized console output
- **Production**: JSON logs to files
  - `logs/error.log` - Error logs only
  - `logs/combined.log` - All logs

## Troubleshooting

### Database connection fails

- Verify `DATABASE_URL` is correct
- Ensure database is accessible (check firewall/IP allowlist in Neon)
- Run `npm run test` to check connection

### Redis connection fails

- Verify `REDIS_URL` is correct
- Check if Upstash instance is active

### Spotify OAuth fails

- Verify redirect URI matches exactly
- Check client ID and secret are correct
- Ensure app is not in development mode (if deployed)

### Push notifications not working

- Verify Firebase credentials are correct
- Check VAPID key is set
- Ensure service worker is registered on frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the test endpoints for diagnostics
