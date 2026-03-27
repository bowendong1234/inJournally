const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const querystring = require('querystring');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { pollSpotifyStreams, refreshUserStreams } = require('./services/spotifyService');

const FRONTEND_URL = process.env.FRONTEND_URL;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const emailPass = process.env.EMAIL_PASS;

// ─── Scheduled ────────────────────────────────────────────────────────────────

exports.pollSpotifyStreamsJob = onSchedule('every 15 minutes', async () => {
    try {
        await pollSpotifyStreams();
    } catch (error) {
        console.error('Scheduled Spotify polling failed:', error);
    }
});

// ─── Callable ─────────────────────────────────────────────────────────────────

// Invoked by the client "Refresh" button. userId comes from the verified auth
// token — never trusted from the request body.
exports.refreshUserStreams = onCall({ invoker: 'public' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be authenticated to refresh streams.');
    }
    const userId = request.auth.uid;
    const { timeZone } = request.data;
    try {
        return await refreshUserStreams(userId, timeZone);
    } catch (error) {
        console.error('refreshUserStreams callable failed:', error);
        throw new HttpsError('internal', 'Failed to refresh streams.');
    }
});

// Invoked by EmailInput when a user submits their Spotify account email.
exports.notifyUserEmailEntered = onCall({ invoker: 'public' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be authenticated.');
    }
    const { email } = request.data;
    if (!email) {
        throw new HttpsError('invalid-argument', 'Missing email.');
    }
    const userId = request.auth.uid;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'injournally@gmail.com', pass: emailPass },
    });
    try {
        await transporter.sendMail({
            from: 'injournally@gmail.com',
            to: 'bowendong123@gmail.com',
            subject: 'User Connected Spotify',
            text: `User ${userId} just connected their Spotify account using email ${email}`,
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new HttpsError('internal', 'Failed to send notification email.');
    }
});

// ─── HTTP — Spotify OAuth (require browser redirects, cannot be callable) ─────

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Step 1: redirect the user's browser to Spotify's authorisation page.
exports.spotifyAuthorise = onRequest({ cors: true, invoker: 'public' }, (_req, res) => {
    const state = generateRandomString(16);
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: 'user-top-read user-read-recently-played',
            redirect_uri: `${FRONTEND_URL}/spotify/callback`,
            state,
            show_dialog: true,
        })
    );
});

// Step 2: exchange the authorization code for access + refresh tokens.
// Called by SpotifyAuth.jsx after Spotify redirects back to the client.
exports.spotifyCallback = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
    const code = req.query.code || null;
    if (!code) {
        return res.redirect('/?' + querystring.stringify({ error: 'state_mismatch' }));
    }
    try {
        const authToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            querystring.stringify({
                code,
                redirect_uri: `${FRONTEND_URL}/spotify/callback`,
                grant_type: 'authorization_code',
            }),
            {
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        const { access_token, refresh_token, expires_in } = response.data;
        res.json({ access_token, refresh_token, expires_in });
    } catch (error) {
        console.error('Error exchanging Spotify auth code:', error);
        res.redirect('/?' + querystring.stringify({ error: 'invalid_token' }));
    }
});
