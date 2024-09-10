const axios = require('axios');
require('dotenv').config();
const { collection, getDocs, query, where, doc, updateDoc, getDoc } = require('firebase-admin/firestore');
const { db } = require('../config/firebaseConfig');
const querystring = require('querystring');
const dayjs = require('dayjs')

async function getAccessToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');  // Encoding clientId:clientSecret to base64
    try {
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authString}`,
                },
            }
        );
        console.log(response.data.access_token)
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get access token');
    }
}

async function pollSpotifyStreams() {
    const users = await getUsersFromFirebase();

    for (const user of users) {
        var accessToken = user.spotifyAccessToken;
        const tokenExpiresAt = user.tokenExpiresAt;
        const spotifyRefreshToken = user.spotifyRefreshToken

        if (accessToken) {
            if (tokenExpiresAt < Date.now()) {
                accessToken = await getNewToken(spotifyRefreshToken, user.uid)
            }
            try {
                const streams = await fetchSpotifyStreams(accessToken);
                // console.log(streams)
                await saveStreamsToDatabase(user.uid, streams); // Store in your database
            } catch (err) {
                // Handle token refresh logic or other errors
                console.error("error when fetching streams", err)
            }
        }
    }
}

async function fetchSpotifyStreams(accessToken) {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.items;
}

async function getUsersFromFirebase() {
    try {
        const users = [];
        const querySnapshot = await db.collection('Users').where('spotifyAccessToken', '!=', null).get();
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            users.push({
                uid: doc.id,
                spotifyAccessToken: userData.spotifyAccessToken,
                spotifyRefreshToken: userData.spotifyRefreshToken,
                tokenExpiresAt: userData.tokenExpiresAt,
            });
        });
        console.log(users)
        return users; // Return the array of user data

    } catch (error) {
        console.error("Error fetching users from Firebase: ", error);
        return [];
    }
}

async function saveStreamsToDatabase(uid, streams) {
    const today = dayjs().format('YYYY-MM-DD');
    for (const stream of streams) {
        const artistName = stream.track.artists[0].name; 
        const artistId = stream.track.artists[0].id
        const songName = stream.track.name;
        const songImageUrl = stream.track.album.images[0].url; 
        const playedAt = stream.played_at;
        const playDate = dayjs(playedAt).format('YYYY-MM-DD');
        if (playDate == today) {
            const streamDetails = { artist: artistName, song: songName, song_image_url: songImageUrl, artist_id: artistId }
            const docPath = `Users/${uid}/UserStreaming/${today}/Streams/${playedAt}`;
            await db.doc(docPath).set(streamDetails, { merge: true })
        }
    }
}

async function getNewToken(spotifyRefreshToken, userID) {
    console.log("Getting new TOken")
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    try {
        const authToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            refresh_token: spotifyRefreshToken,
            grant_type: 'refresh_token',
            clientId: clientId,
        }), {
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        console.log(response.data)
        console.log("new access token", access_token)
        console.log("new refresh token", refresh_token)
        var actual_refresh_token = null
        if (refresh_token) { // spotify doesn't always return a new refresh token for some reason??? actual refresh token might be old access token documentation not clear
            actual_refresh_token = refresh_token
            console.log("NEWWWWWWWWWWWWWWWWWWWWWWW")
        } else {
            actual_refresh_token = spotifyRefreshToken
            console.log("OLDDDDDDDDDD")
        }
        const token_expiry = Date.now() + (expires_in - 10) * 1000;
        try {
            await db.collection("Users").doc(userID).update({ spotifyAccessToken: access_token, spotifyRefreshToken: actual_refresh_token, tokenExpiresAt: token_expiry })
        } catch (error) {
            console.error("error when trying to update new refreshed token", error)
        }



    } catch (error) {
        console.error('Error fetching access token:', error);
        res.redirect('/?' +
            querystring.stringify({
                error: 'invalid_token'
            })
        );
    }
}

module.exports = { getAccessToken, pollSpotifyStreams };
