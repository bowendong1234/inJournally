const axios = require('axios');
const { collection, getDocs, query, where, doc, updateDoc, getDoc } = require('firebase-admin/firestore');
const { db, serviceAccount } = require('../config/firebaseConfig');
const querystring = require('querystring');
const dayjs = require('dayjs')
const dotenv = require('dotenv');
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

async function getAccessToken() {
    const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
    dotenv.config({ path: envFile });
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
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get access token');
    }
}

async function pollSpotifyStreams() {
    const users = await getUsersFromFirebase();
    await Promise.all(users.map(async (user) => {
        var accessToken = user.spotifyAccessToken;
        const tokenExpiresAt = user.tokenExpiresAt;
        const spotifyRefreshToken = user.spotifyRefreshToken
        const timeZone = user.userTimeZone

        if (accessToken) {
            if (tokenExpiresAt < Date.now()) {
                accessToken = await getNewToken(spotifyRefreshToken, user.uid)
            }
            try {
                const streams = await fetchSpotifyStreams(accessToken);

                await saveStreamsToDatabase(user.uid, streams, accessToken, timeZone);
            } catch (err) {
                console.error("error when fetching streams", err)
            }
        }
    }))
    // for (const user of users) {
    //     var accessToken = user.spotifyAccessToken;
    //     const tokenExpiresAt = user.tokenExpiresAt;
    //     const spotifyRefreshToken = user.spotifyRefreshToken
    //     const timeZone = user.userTimeZone

    //     if (accessToken) {
    //         if (tokenExpiresAt < Date.now()) {
    //             accessToken = await getNewToken(spotifyRefreshToken, user.uid)
    //         }
    //         try {
    //             const streams = await fetchSpotifyStreams(accessToken);

    //             await saveStreamsToDatabase(user.uid, streams, accessToken, timeZone);
    //         } catch (err) {
    //             console.error("error when fetching streams", err)
    //         }
    //     }
    // }
}

async function fetchSpotifyStreams(accessToken) {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=6', {
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
                userTimeZone: userData.userTimeZone
            });
        });
        return users;

    } catch (error) {
        console.error("Error fetching users from Firebase: ", error);
        return [];
    }
}

async function saveStreamsToDatabase(uid, streams, accessToken, timeZone) {
    await Promise.all(streams.map(async (stream) => {
        const artistName = stream.track.artists[0].name; 
        const artistId = stream.track.artists[0].id
        const songName = stream.track.name;
        const songImageUrl = stream.track.album.images[0].url;
        const artistImageUrl = await getArtistImageUrl(artistId, accessToken)
        const playedAt = dayjs(stream.played_at).tz(timeZone)
        const playDate = playedAt.format("YYYY-MM-DD");

        const streamDetails = { artist: artistName, song: songName, song_image_url: songImageUrl, artist_id: artistId, artist_image_url: artistImageUrl }
        const docPath = `Users/${uid}/UserStreaming/${playDate}/Streams/${playedAt.format("YYYY-MM-DD HH:mm:ss Z")}`;
        try {
            await db.doc(docPath).set(streamDetails, { merge: true })
        } catch (error) {
            console.error("Error saving stream to Firebase: ", error)
        }
    }))
    // for (const stream of streams) {
    //     const artistName = stream.track.artists[0].name; 
    //     const artistId = stream.track.artists[0].id
    //     const songName = stream.track.name;
    //     const songImageUrl = stream.track.album.images[0].url;
    //     const artistImageUrl = await getArtistImageUrl(artistId, accessToken)
    //     const playedAt = dayjs(stream.played_at).tz(timeZone)
    //     const playDate = playedAt.format("YYYY-MM-DD");

    //     const streamDetails = { artist: artistName, song: songName, song_image_url: songImageUrl, artist_id: artistId, artist_image_url: artistImageUrl }
    //     const docPath = `Users/${uid}/UserStreaming/${playDate}/Streams/${playedAt.format("YYYY-MM-DD HH:mm:ss Z")}`;
    //     try {
    //         await db.doc(docPath).set(streamDetails, { merge: true })
    //     } catch (error) {
    //         console.error("Error saving stream to Firebase: ", error)
    //     }
    // }
}

async function getArtistImageUrl(artistId, accessToken) {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return response.data.images[0].url;  
}

async function getNewToken(spotifyRefreshToken, userID) {
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
        var actual_refresh_token = null
        if (refresh_token) { // spotify doesn't always return a new refresh token for some reason??? actual refresh token might be old access token documentation not clear
            actual_refresh_token = refresh_token
        } else {
            actual_refresh_token = spotifyRefreshToken
        }
        const token_expiry = Date.now() + (expires_in - 10) * 1000;
        try {
            await db.collection("Users").doc(userID).update({ spotifyAccessToken: access_token, spotifyRefreshToken: actual_refresh_token, tokenExpiresAt: token_expiry })
        } catch (error) {
            console.error("error when trying to update new refreshed token", error)
        }
        return access_token

    } catch (error) {
        console.error('Error fetching access token:', error);
        res.redirect('/?' +
            querystring.stringify({
                error: 'invalid_token'
            })
        );
    }
}

// function that refreshes streams of a specific user
async function refreshUserStreams(userID, timeZone) {
    try {
        const doc = await db.collection('Users').doc(userID).get();
        const userData = doc.data();
        var spotifyAccessToken = userData.spotifyAccessToken
        const spotifyRefreshToken = userData.spotifyRefreshToken
        const tokenExpiresAt = userData.tokenExpiresAt
        if (spotifyAccessToken) {
            if (tokenExpiresAt < Date.now()) {
                spotifyAccessToken = await getNewToken(spotifyRefreshToken, userID)
            }
            try {
                const streams = await fetchSpotifyStreams(spotifyAccessToken);
                await saveStreamsToDatabase(userID, streams, spotifyAccessToken, timeZone);
                return {success: 1}
            } catch (err) {
                console.error("error when fetching streams", err)
            }
        } 
    } catch (error) {
        console.error("Error user Spotify access token from Firebase: ", error);
    }


}

module.exports = { getAccessToken, pollSpotifyStreams, refreshUserStreams};
