const express = require('express');
const { getAccessToken, refreshUserStreams } = require('../services/spotifyService'); 
const querystring = require('querystring');
const router = express.Router();
const axios = require('axios');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
const FRONTEND_URL = process.env.FRONTEND_URL
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const emailPass = process.env.EMAIL_PASS

router.get('/getAccessToken', async (req, res) => {
    const token = await getAccessToken();
    res.json({ token });
});

router.get('/authorise', (req, res) => {
    var state = generateRandomString(16);
    var scope = "user-top-read user-read-recently-played"
    console.log(FRONTEND_URL)
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: `${FRONTEND_URL}/spotify/callback`, // TODO: this should be frontend url
            state: state,
            show_dialog: true
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
            redirect_uri: `${FRONTEND_URL}/spotify/callback`, // TODO: this should be frontend url
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

// Route for updating streaming data of one specific user
router.post('/refreshUserStreams', async (req, res) => {
    const { userId, timeZone } = req.body;
    if (!userId) {
        return res.status(400).send('Invalid request body.');
    }
    try {
        const results = await refreshUserStreams(userId, timeZone)
        res.send(results);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// post request to notify email addition
router.post('/notifyUserEmailEntered', async (req, res) => {
    console.log("Email Password:", emailPass ? "Loaded" : "Not Loaded"); 

    const { userID, email } = req.body;
    
    if (!userID || !email) {
        return res.status(400).json({ error: "Missing userID or email" });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "injournally@gmail.com",
            pass: emailPass,  // app password not acc password
        },
    });

    const mailOptions = {
        from: "injournally@gmail.com",
        to: "bowendong123@gmail.com",
        subject: "User Connected Spotify",
        text: `User ${userID} just connected their Spotify account using email ${email}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

module.exports = router;  
