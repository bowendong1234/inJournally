import { React, useEffect, useState } from 'react';
import './Spotify.css'
import dayjs from 'dayjs';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from "../Firebase"



const Spotify = () => {
    const { currentUser } = useAuth();
    let date = useParams()
    const [showLogin, setShowLogin] = useState(true);
    const [topSongs, setTopSongs] = useState(null)
    const [topArtist, setTopArtist] = useState(null)

    useEffect(() => {
        const fetchAccessToken = async () => {
            const accessToken = await checkAccessToken();
            if (!accessToken) {
                console.log("No token user has not logged in");
            } else {
                // setShowLogin(false)
                console.log("Access Token:", accessToken);
                fetchStreamingData()
            }
        };

        fetchAccessToken();

        const fetchStreamingData = async () => {
            const userId = currentUser.uid;
            if (!date || date == "redirect") {
                date = dayjs().format('YYYY-MM-DD');
            }
            const ref = collection(db, "Users", userId, "UserStreaming", date.date, "Streams")
            const querySnap = await getDocs(ref)
            let allStreams = []
            querySnap.forEach((docSnap) => {
                const streamData = docSnap.data()
                allStreams.push([streamData.song, streamData.artist, streamData.song_image_url, streamData.artist_id])
            })
            calculateTop(allStreams)
        };
    }, []);

    const calculateTop = (allStreams) => {
        const songFrequencyMap = {};
        const artistFrequencyMap = {};
        allStreams.forEach(([song, artist, song_image_url, artist_id]) => {
            // song frequencies
            const songKey = `${song}:${artist}`;
            if (songFrequencyMap[songKey]) {
                songFrequencyMap[songKey].count += 1;
            } else {
                songFrequencyMap[songKey] = { count: 1, song, artist, song_image_url, artist_id };
            }
            // artist frequencies
            if (artistFrequencyMap[artist_id]) {
                artistFrequencyMap[artist_id].count += 1;
            } else {
                artistFrequencyMap[artist_id] = { count: 1, artist, artist_id };
            }
        });

        const sortedSongs = Object.values(songFrequencyMap).sort((a, b) => b.count - a.count);
        const mostFrequentArtist = Object.values(artistFrequencyMap).sort((a, b) => b.count - a.count)[0];

        // Output sorted songs and most frequent artist
        console.log("Sorted Songs by Frequency:", sortedSongs);
        console.log("Most Frequent Artist:", mostFrequentArtist);
    };

    const getAristImageUrl = async (artistId) => {
        try {
            const response = await fetch('http://localhost:3000/spotify/getArtistImageUrl')
            const data = await response.json();
            console.log(data.token)
        } catch (error) {
            console.error("Error when getting Spotify Access Token", error)
        }
    }

    const getAccessToken = async () => {
        try {
            const response = await fetch('http://localhost:3000/spotify/getAccessToken')
            const data = await response.json();
            console.log(data.token)
        } catch (error) {
            console.error("Error when getting Spotify Access Token", error)
        }
    }

    const checkAccessToken = async () => {
        let accessToken = null
        const uid = localStorage.getItem("userID")
        const docRef = doc(db, `Users/${uid}`)
        const userDoc = await getDoc(docRef)
        if (userDoc.exists()) {
            accessToken = userDoc.data().spotifyAccessToken
        }
        return accessToken
    }

    const loginToSpotify = () => {
        try {
            window.location.href = 'http://localhost:3000/spotify/authorise'; // Redirects to the backend route
        } catch (error) {
            console.error('Error when authorising user', error);
        }
    };

    return (
        <div class="outer-spotify-container">
            {showLogin ? (
                <div>
                    <div class="login-prompt">To see your daily listening activity, log in to Spotify:</div>
                    <button class="spotify-login-button" onClick={loginToSpotify}>
                        <img src="/images/Spotify_Primary_Logo_RGB_Green.png" alt="Spotify Logo" class="spotify-logo" />
                        Log in to Spotify
                    </button>
                </div>
            ) : (
                <div></div>
            )}

        </div>
    )
}

export default Spotify;