import { React, useEffect } from 'react';
import './Spotify.css'
import dayjs from 'dayjs';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';



const Spotify = () => {
    const { currentUser } = useAuth();
    let date = useParams()
    let songs = null
    let artists = null
    let genres = null

    useEffect(() => {
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

        fetchStreamingData();
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
            <button onClick={getAccessToken}>test token</button>
            <button onClick={loginToSpotify}>spotify login</button>
        </div>
    )
}

export default Spotify;