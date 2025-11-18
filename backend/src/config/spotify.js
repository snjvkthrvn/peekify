/**
 * Spotify API Configuration
 * OAuth endpoints and API base URLs
 */

const config = require('./env');

const spotifyConfig = {
  // OAuth endpoints
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',

  // API base URL
  apiBaseUrl: 'https://api.spotify.com/v1',

  // OAuth scopes needed for the app
  scopes: [
    'user-read-email',
    'user-read-private',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state',
    'user-read-currently-playing',
  ],

  // Client credentials
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
  redirectUri: config.spotify.redirectUri,

  /**
   * Generate Spotify authorization URL
   * @param {string} state - Random state for CSRF protection
   * @returns {string} Authorization URL
   */
  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: state,
      show_dialog: 'false',
    });

    return `${this.authUrl}?${params.toString()}`;
  },
};

module.exports = spotifyConfig;
