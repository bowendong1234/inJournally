require('dotenv').config();
const express = require('express');
const { getAccessToken } = require('../services/spotifyService'); 
const querystring = require('querystring');
const router = express.Router();
const axios = require('axios');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

router.get('/getAccessToken', async (req, res) => {
    const token = await getAccessToken();
    res.json({ token });
});

router.get('/authorise', (req, res) => {
    var state = generateRandomString(16);
    var scope = "user-top-read user-read-recently-played"
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: "http://localhost:5173/spotify/callback", // PLS REMEMENGER TO CHANGE THIS WHEN U DEPLOY
            state: state
        }));
});

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (!code) {
        return res.redirect('/?' +
            querystring.stringify({ error: 'state_mismatch' })
        );
    }

    try {
        const authToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            code: code,
            redirect_uri: "http://localhost:5173/spotify/callback",
            grant_type: 'authorization_code',
        }), {
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        console.log("Access Token:", access_token);
        console.log("refresh Token:", refresh_token);
        console.log("expire:", expires_in);

        res.json({ access_token, refresh_token, expires_in})
        // res.redirect('/?' +
        //     querystring.stringify({
        //         access_token: access_token,
        //         refresh_token: refresh_token,
        //         expires_in: expires_in
        //     })
        // );

    } catch (error) {
        console.error('Error fetching access token:', error);
        res.redirect('/?' +
            querystring.stringify({
                error: 'invalid_token'
            })
        );
    }
});

// http://localhost:5173/spotify/callback?code=AQALFgpEI4faYep8UCbqCMsSIAdZa21ELBpTVqie1mf8zeELxl-1Ot_bRHMsUmo4gLSgkQ6qSN_UVahs-mIFHpYVxMq7lj1l1ZE5chfumeNaxJ1iNXxHnw8EelCYwPeJps5YV_tSjPdWqRdzmsB7RFPjdqCgCz9a7unzSAJ2GOSRlUXL8F9FzhjQ1nMs6JIBth08cFHZpkBnlXHqFcpetExBuORtAq8Lcq5x1IvYj-TehbaG&state=URax2gJeJ4lTWyJb
module.exports = router;  
