/**
 * Supabase Storage Configuration
 * Used for storing user profile pictures and other uploads
 * No credit card required for free tier
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./env');
const logger = require('../utils/logger');

// Create Supabase client with service role key
// Service role key bypasses RLS policies
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const BUCKET_NAME = config.supabase.bucket;

/**
 * Upload file to Supabase Storage
 * @param {string} fileName - Name of the file (including path)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadFile(fileName, fileBuffer, contentType) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true, // Overwrite if file exists
      });

    if (error) {
      logger.error('Supabase upload error', { error: error.message });
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    logger.info('File uploaded to Supabase', { fileName, url: urlData.publicUrl });
    return urlData.publicUrl;
  } catch (error) {
    logger.error('Failed to upload file to Supabase', { fileName, error: error.message });
    throw error;
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} fileName - Name of the file (including path)
 */
async function deleteFile(fileName) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      logger.error('Supabase delete error', { error: error.message });
      throw error;
    }

    logger.info('File deleted from Supabase', { fileName });
  } catch (error) {
    logger.error('Failed to delete file from Supabase', { fileName, error: error.message });
    throw error;
  }
}

/**
 * Test Supabase connection by checking bucket existence
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection() {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      logger.error('Supabase connection test failed', { error: error.message });
      return false;
    }

    const bucketExists = data.some(bucket => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      logger.warn(`Bucket '${BUCKET_NAME}' not found. Please create it in Supabase dashboard.`);
      return false;
    }

    logger.info('Supabase connection successful', { bucket: BUCKET_NAME });
    return true;
  } catch (error) {
    logger.error('Supabase connection test error', { error: error.message });
    return false;
  }
}

module.exports = {
  supabase,
  uploadFile,
  deleteFile,
  testConnection,
  BUCKET_NAME,
};
