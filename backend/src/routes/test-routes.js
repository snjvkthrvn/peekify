/**
 * Test Routes
 * Provides health check and configuration test endpoints
 */

const express = require('express');
const router = express.Router();
const { testConnection: testDb } = require('../config/db');
const { testConnection: testRedis } = require('../config/redis');
const { testConnection: testSupabase } = require('../config/supabase');
const { testConnection: testFirebase, vapidKey } = require('../config/firebase');
const config = require('../config/env');
const { asyncHandler } = require('../utils/errors');

/**
 * GET /test
 * Basic health check
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Replay backend is running!',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/**
 * GET /test/db
 * Test database connection
 */
router.get('/db', asyncHandler(async (req, res) => {
  const isConnected = await testDb();

  res.json({
    success: isConnected,
    service: 'Neon PostgreSQL',
    connected: isConnected,
  });
}));

/**
 * GET /test/redis
 * Test Redis connection
 */
router.get('/redis', asyncHandler(async (req, res) => {
  const isConnected = await testRedis();

  res.json({
    success: isConnected,
    service: 'Upstash Redis',
    connected: isConnected,
  });
}));

/**
 * GET /test/supabase
 * Test Supabase Storage connection
 */
router.get('/supabase', asyncHandler(async (req, res) => {
  const isConnected = await testSupabase();

  res.json({
    success: isConnected,
    service: 'Supabase Storage',
    connected: isConnected,
    bucket: config.supabase.bucket,
  });
}));

/**
 * GET /test/firebase
 * Test Firebase configuration
 */
router.get('/firebase', asyncHandler(async (req, res) => {
  const isConfigured = await testFirebase();

  res.json({
    success: isConfigured,
    service: 'Firebase Cloud Messaging',
    configured: isConfigured,
  });
}));

/**
 * GET /test/spotify
 * Test Spotify configuration
 */
router.get('/spotify', (req, res) => {
  const hasClientId = !!config.spotify.clientId;
  const hasClientSecret = !!config.spotify.clientSecret;
  const hasRedirectUri = !!config.spotify.redirectUri;

  const isConfigured = hasClientId && hasClientSecret && hasRedirectUri;

  res.json({
    success: isConfigured,
    service: 'Spotify API',
    configured: isConfigured,
    details: {
      hasClientId,
      hasClientSecret,
      hasRedirectUri,
    },
  });
});

/**
 * GET /test/vapid
 * Test VAPID key configuration
 */
router.get('/vapid', (req, res) => {
  const hasVapidKey = !!vapidKey;

  res.json({
    success: hasVapidKey,
    service: 'VAPID Key',
    configured: hasVapidKey,
    vapidKey: hasVapidKey ? vapidKey : null,
  });
});

/**
 * GET /test/ws
 * Get WebSocket URL
 */
router.get('/ws', (req, res) => {
  res.json({
    success: true,
    websocketUrl: config.websocket.url,
  });
});

/**
 * GET /test/all
 * Test all services at once
 */
router.get('/all', asyncHandler(async (req, res) => {
  const [dbConnected, redisConnected, supabaseConnected, firebaseConfigured] = await Promise.all([
    testDb(),
    testRedis(),
    testSupabase(),
    testFirebase(),
  ]);

  const spotifyConfigured =
    !!config.spotify.clientId && !!config.spotify.clientSecret && !!config.spotify.redirectUri;

  const allPassing =
    dbConnected && redisConnected && supabaseConnected && firebaseConfigured && spotifyConfigured;

  res.json({
    success: allPassing,
    services: {
      database: {
        name: 'Neon PostgreSQL',
        connected: dbConnected,
      },
      cache: {
        name: 'Upstash Redis',
        connected: redisConnected,
      },
      storage: {
        name: 'Supabase Storage',
        connected: supabaseConnected,
      },
      notifications: {
        name: 'Firebase Cloud Messaging',
        configured: firebaseConfigured,
      },
      spotify: {
        name: 'Spotify API',
        configured: spotifyConfigured,
      },
    },
  });
}));

module.exports = router;
