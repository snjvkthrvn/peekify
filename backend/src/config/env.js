/**
 * Environment Configuration
 * Loads and validates all environment variables
 * Uses dotenv to load .env file in development
 */

require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Spotify OAuth
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  },

  // Database (Neon PostgreSQL)
  database: {
    url: process.env.DATABASE_URL,
  },

  // Redis (Upstash)
  redis: {
    url: process.env.REDIS_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d', // JWT tokens expire after 7 days
  },

  // Supabase Storage
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_BUCKET || 'avatars',
  },

  // Firebase Cloud Messaging
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    vapidKey: process.env.FIREBASE_VAPID_KEY,
  },

  // Sentry (optional)
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  // Frontend URL (for CORS)
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
  },

  // WebSocket URL
  websocket: {
    url: process.env.WS_URL || 'ws://localhost:3000',
  },
};

/**
 * Validates required environment variables
 * Throws error if critical variables are missing
 */
function validateConfig() {
  const required = [
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SPOTIFY_REDIRECT_URI',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file'
    );
  }
}

// Validate on load (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config;
