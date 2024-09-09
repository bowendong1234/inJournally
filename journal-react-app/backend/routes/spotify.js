const express = require('express');
const { getAccessToken } = require('../services/spotifyService');  // Import the service
const router = express.Router();

router.get('/getAccessToken', async (req, res) => {
    const token = await getAccessToken();
    res.json({ token });
});

module.exports = router;  
