import { React, useEffect, useState } from 'react';
import './Spotify.css'
import dayjs from 'dayjs';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from "../Firebase"



const Spotify = () => {
    const { currentUser } = useAuth();
    let date = useParams()
    let songs = null
    let artists = null
    let genres = null
    const [showLogin, setShowLogin] = useState(true);

    useEffect(() => {
        const fetchAccessToken = async () => {
            const accessToken = await checkAccessToken();
            if (!accessToken) {
                console.log("No token user has not logged in");
            } else {
                // setShowLogin(false)
                console.log("Access Token:", accessToken);
                // fetchStreamingData()
            }
        };

        fetchAccessToken();

        const fetchStreamingData = async () => {
            const userId = currentUser.uid;
            if (!date || date == "redirect") {
                date = dayjs().format('YYYY-MM-DD');
            }
            const documentPath = `Users/${userId}/UserStreaming/${date.date}`;
            const dataSnapshot = await getDoc(documentPath)

            if (dataSnapshot.exists) {
                const streams = dataSnapshot.data().streams;

                const topSongs = calculateTop(streams, 'track');
                const topArtists = calculateTop(streams, 'artist');
                const topGenres = calculateTop(streams, 'genre');

                // setTopSongs(topSongs);
                // setTopArtists(topArtists);
                // setTopGenres(topGenres);
                songs = topSongs;
                artists = topArtists;
                genres = topGenres;
            }
        };

        // fetchStreamingData();
    }, []);

    const calculateTop = (streams, type) => {
        const counts = streams.reduce((acc, stream) => {
            const key = type === 'track' ? stream.track.name :
                type === 'artist' ? stream.track.artists[0].name :
                    stream.track.genre;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    };

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
            {songs} {artists} {genres}
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