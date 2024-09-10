const axios = require('axios');
require('dotenv').config(); 

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

// async function authorise() {
//     const clientId = process.env.SPOTIFY_CLIENT_ID;
//     const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
//     var state = generateRandomString(16);
//     var scope = "user-top-read user-read-recently-played"

//     const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');  // Encoding clientId:clientSecret to base64
//     try {
//         const response = await axios.post(
//             'https://accounts.spotify.com/api/token',
//             'grant_type=client_credentials', 
//             {
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                     'Authorization': `Basic ${authString}`,
//                 },
//             }
//         );
//         console.log(response.data.access_token)
//         return response.data.access_token;
//     } catch (error) {
//         console.error('Error fetching access token:', error.response ? error.response.data : error.message);
//         throw new Error('Failed to get access token');
//     }
// }

module.exports = { getAccessToken };  // Export the function
