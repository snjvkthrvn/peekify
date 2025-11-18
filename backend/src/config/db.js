/**
 * Database Configuration
 * PostgreSQL connection using node-postgres (pg)
 * Connects to Neon PostgreSQL database
 */

const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

// Create connection pool
const pool = new Pool({
  connectionString: config.database.url,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection fails
});

// Log pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', err);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error', { text, error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Add query tracking
  client.query = (...args) => {
    const start = Date.now();
    return originalQuery.apply(client, args).then((result) => {
      const duration = Date.now() - start;
      logger.debug('Client query', { duration, rows: result.rowCount });
      return result;
    });
  };

  // Prevent releasing twice
  let released = false;
  client.release = () => {
    if (released) {
      logger.warn('Client already released');
      return;
    }
    released = true;
    return originalRelease.apply(client);
  };

  return client;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    logger.info('Database connection successful', { time: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    return false;
  }
}

/**
 * Close all database connections
 * Call this when shutting down the server
 */
async function close() {
  await pool.end();
  logger.info('Database pool closed');
}

module.exports = {
  query,
  getClient,
  testConnection,
  close,
  pool,
};
