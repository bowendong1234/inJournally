import { React, useEffect, useState } from 'react';
import './Spotify.css'
import dayjs from 'dayjs';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { db } from "../Firebase"
import { Scrollbar } from 'smooth-scrollbar-react';
import Song from './Song';
import TopStreamComponent from './TopStream';
import EmailInput from './EmailInput';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Spotify = () => {
    const { currentUser } = useAuth();
    let date = useParams()
    const [showLogin, setShowLogin] = useState(true);
    const [topSongs, setTopSongs] = useState(null)
    const [topArtist, setTopArtist] = useState(null)
    const [streamingDataMsg, setStreamingDataMsg] = useState("");
    const [spotifyEmailEntered, setSpotifyEmailEntered] = useState(false)
    const [spotifyEmailVerified, setSpotifyEmailVerified] = useState(false)
    const [userSpotifyEmail, setUserSpotifyEmail] = useState("")

    useEffect(() => {
        const fetchAccessToken = async () => {
            const accessToken = await checkAccessToken();
            if (!accessToken) {
                console.log("No token user has not completed spotify auth");
            } else {
                setShowLogin(false)
                fetchStreamingData()
            }
        };

        fetchAccessToken();
        initialiseUserSpotifyParameters();
    }, [date]);

    useEffect(() => {
        const today = dayjs()
        const entryDate = dayjs(date.date)
        if (entryDate.isBefore(today, 'date')) {
            setStreamingDataMsg("No recorded listening data on this day");
        } else if (entryDate.isSame(today, 'date')) {
            setStreamingDataMsg("No listening data for today yet. Listening data refreshes every 5 minutes")
        } else {
            setStreamingDataMsg("Future date has no recorded listening data")
        }
    }, [date]);

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
            allStreams.push([streamData.song, streamData.artist, streamData.song_image_url, streamData.artist_id, streamData.artist_image_url])
        })
        calculateTop(allStreams)

    };

    const calculateTop = (allStreams) => {
        const songFrequencyMap = {};
        const artistFrequencyMap = {};
        allStreams.forEach(([song, artist, song_image_url, artist_id, artist_image_url]) => {
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
                artistFrequencyMap[artist_id] = { count: 1, artist, artist_id, artist_image_url };
            }
        });

        const sortedSongs = Object.values(songFrequencyMap)
            .sort((a, b) => b.count - a.count)
            .map(({ song, artist, song_image_url }) => [song, artist, song_image_url]);

        // Finding the most frequent artist
        const mostFrequentArtist = Object.values(artistFrequencyMap)
            .sort((a, b) => b.count - a.count)
            .map(({ artist, artist_image_url }) => [artist, artist_image_url])[0]

        // Output sorted songs and most frequent artist
        // console.log("Sorted Songs by Frequency:", sortedSongs);
        // console.log("Most Frequent Artist:", mostFrequentArtist);
        setTopSongs(sortedSongs)
        setTopArtist(mostFrequentArtist)
    };

    // method for switching to the email pending tab once email is entered
    function switchToPending(userSpotifyEmail) {
            setSpotifyEmailEntered(true)
            setUserSpotifyEmail(userSpotifyEmail)
        }

    const getAccessToken = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/spotify/getAccessToken`) // EDIT URL
            const data = await response.json();
            console.log(data.token)
        } catch (error) {
            console.error("Error when getting Spotify Access Token", error)
        }
    }

    // method for checking spotify auth status
    const initialiseUserSpotifyParameters = async () => {
        const uid = localStorage.getItem("userID")
        const docRef = doc(db, `Users/${uid}`)
        const userDoc = await getDoc(docRef)
        if (!userDoc.exists()) {
            await setDoc(doc(db, `Users/${uid}`), { emailEntered: false, accountVerified: false })
        } else if (userDoc.exists()) {
            setSpotifyEmailEntered(userDoc.data().emailEntered)
            setSpotifyEmailVerified(userDoc.data().accountVerified)
            setUserSpotifyEmail(userDoc.data().spotifyAccountEmail)
            console.log(spotifyEmailEntered)
            console.log(spotifyEmailVerified)
        };
        // // TODO: GET RID OF THIS!!! testing piurposes only!!!
        // setSpotifyEmailEntered(true)
        // setSpotifyEmailEntered("placeholder@email")
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

    const loginToSpotify = async () => {
        const userId = currentUser.uid;
        const docRef = doc(db, `Users/${userId}`)
        const userDoc = await getDoc(docRef)

        if (!userDoc.exists()) {
            const ref = collection(db, "Users")
            await setDoc(doc(ref, userId), {
                spotifyAccessToken: null
            })
        }
        try {
            window.location.href = `${API_BASE_URL}/spotify/authorise`;
        } catch (error) {
            console.error('Error when authorising user', error);
        }
    };

    const refreshStreamingData = async () => {
        const userId = localStorage.getItem("userID")
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const response = await fetch(`${API_BASE_URL}/spotify/refreshUserStreams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'userId': userId, 'timeZone': userTimeZone })
            });
            const result = await response.json();
            if (result.success) {
                console.log('Streams refreshed successfully.');
                fetchStreamingData()
            } else {
                console.error('Stream refresh failed :(');
            }
        } catch (error) {
            console.error("Error refreshing streams: ", error)
        }

    }

    return (
        <div class="outer-spotify-container">
            {/*if the user hasn't entered their spotify email*/}
            {!spotifyEmailEntered ? (
                <EmailInput switchToPending={switchToPending}></EmailInput>     
            ) : (
                <div class="division-expander">
                    {/*if the user has entered their spotify email but have not been verified yet*/}
                    {spotifyEmailEntered && !spotifyEmailVerified ? (
                        <div class="subheading">
                        <div>Spotify account email pending approval!</div>
                        <div>The email associated with your Spotify account you entered was <b>{userSpotifyEmail}</b> and may take up to 36 hours to be approved.</div>
                        </div>

                    ) : (
                        <div class="division-expander">
                            {showLogin ? (
                                <div>
                                    <div class="login-prompt">Email approved! To see your daily listening activity, log in to Spotify:</div>
                                    <button class="spotify-login-button" onClick={loginToSpotify}>
                                        <img src="/images/Spotify_Primary_Logo_RGB_Green.png" alt="Spotify Logo" class="spotify-logo" />
                                        <div>Log in to Spotify</div>
                                    </button>
                                </div>
                            ) : (
                                <Scrollbar style={{ height: '100%', width: '100%' }}>
                                    <div className="inner-spotify-container">
                                        <button onClick={refreshStreamingData} class="refresh-button">Refresh</button>
                                        <div className="primary-layout" >
                                            {topSongs == null || topSongs.length == 0 ? (
                                                <div className="no-data-text" >
                                                    {streamingDataMsg}
                                                </div>
                                            ) : (
                                                <div class="main-text">
                                                    Your top listening on this day
                                                    <div class="gap"></div>

                                                    <TopStreamComponent
                                                        songName={topSongs[0][0]}
                                                        artistName={topSongs[0][1]}
                                                        albumArt={topSongs[0][2]}
                                                        topArtist={topArtist[0]}
                                                        artistArt={topArtist[1]}
                                                    ></TopStreamComponent>

                                                    <div className="topsongs-container">
                                                        <div className="song-column">
                                                            {topSongs.slice(1, 6).map((stream, index) => (
                                                                <Song
                                                                    key={index}
                                                                    songName={stream[0]}
                                                                    artistName={stream[1]}
                                                                    albumArt={stream[2]}
                                                                    number={index + 2}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="song-column">
                                                            {topSongs.slice(6, 11).map((stream, index) => (
                                                                <Song
                                                                    key={index}
                                                                    songName={stream[0]}
                                                                    artistName={stream[1]}
                                                                    albumArt={stream[2]}
                                                                    number={index + 7}
                                                                />
                                                            ))}

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Scrollbar>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


export default Spotify;