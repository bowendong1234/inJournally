const express = require('express');
const cors = require('cors');
const firebaseRoutes = require('./routes/firebase');
const spotifyRoutes = require('./routes/spotify');
const { pollSpotifyStreams } = require('./services/spotifyService');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Firebase/storage routes
app.use('/api', firebaseRoutes);

// Spotify routes
app.use('/spotify', spotifyRoutes);

// Manual trigger endpoint for stream polling
app.get('/pollAllUserStreaming', async (req, res) => {
  try {
    await pollSpotifyStreams();
    res.json({ message: 'Manual polling completed successfully.' });
  } catch (error) {
    console.error('Error polling spotify streams:', error);
    res.status(500).json({ error: 'Failed to poll Spotify streams.' });
  }
});

module.exports = app;
