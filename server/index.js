const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const app = require('./app');
const { pollSpotifyStreams } = require('./services/spotifyService');

// Main API function wrapping the existing Express app.
exports.backendApi = onRequest({ cors: true }, app);

// Scheduled function for polling user streams.
exports.pollSpotifyStreamsJob = onSchedule('every 15 minutes', async () => {
  try {
    await pollSpotifyStreams();
  } catch (error) {
    console.error('Scheduled Spotify polling failed:', error);
  }
});
