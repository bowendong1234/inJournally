const express = require('express');
const cors = require('cors');
const path = require('path');
const firebaseRoutes = require('./routes/firebase'); 
const spotifyRoutes = require('./routes/spotify');
const { pollSpotifyStreams } = require('./services/spotifyService');

const app = express();

const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
const port = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // For parsing form data

// For Firebase routes
app.use('/api', firebaseRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// for spotify routes
app.use('/spotify', spotifyRoutes);

// for polling streaming data for all users
app.get("/pollAllUserStreaming", async (req, res) => {
    try {
        await pollSpotifyStreams();
		res.json({ message: "Manual CRON polling works yay" });
    } catch (error) {
        console.error("Error polling spotify streams: ", error)
    }
})

// Start the server
app.listen(port, () => {
    console.log(`Server running at ${process.env.API_URL || `http://localhost:${PORT}`}`);
});
