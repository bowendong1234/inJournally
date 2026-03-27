import { React, useEffect, useState, useRef } from 'react';
import './Spotify.css'
import dayjs from 'dayjs';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { db, functions } from "../Firebase"
import { httpsCallable } from 'firebase/functions';
import { Scrollbar } from 'smooth-scrollbar-react';
import Song from './Song';
import TopStreamComponent from './TopStream';
import EmailInput from './EmailInput';
import { buildFunctionUrl } from '../utils/api';

const REFRESH_COOLDOWN_MS = 30000;

const Spotify = () => {
    const { currentUser } = useAuth();
    let date = useParams()
    const [showLogin, setShowLogin] = useState(true);
    const [topSongs, setTopSongs] = useState(null)
    const [topArtist, setTopArtist] = useState(null)
    const [allStreamsRaw, setAllStreamsRaw] = useState([])
    const [streamingDataMsg, setStreamingDataMsg] = useState("");
    const [spotifyEmailEntered, setSpotifyEmailEntered] = useState(false)
    const [spotifyEmailVerified, setSpotifyEmailVerified] = useState(false)
    const [userSpotifyEmail, setUserSpotifyEmail] = useState("")
    const [viewMode, setViewMode] = useState('top')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshCooldown, setRefreshCooldown] = useState(false)
    const cooldownTimerRef = useRef(null)

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

    // Clean up cooldown timer on unmount
    useEffect(() => {
        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, []);

    const fetchStreamingData = async () => {
        const userId = currentUser.uid;
        if (!date || date == "redirect") {
            date = dayjs().format('YYYY-MM-DD');
        }
        const ref = collection(db, "Users", userId, "UserStreaming", date.date, "Streams")
        const querySnap = await getDocs(ref)
        let allStreams = []
        let rawStreams = []
        querySnap.forEach((docSnap) => {
            const streamData = docSnap.data()
            const timestamp = docSnap.id
            // Document ID format: "YYYY-MM-DD HH:mm:ss Z" — extract HH:mm for display
            const timeParts = timestamp.split(' ')
            const timeOfDay = timeParts[1] ? timeParts[1].substring(0, 5) : ''
            allStreams.push([streamData.song, streamData.artist, streamData.song_image_url, streamData.artist_id, streamData.artist_image_url])
            rawStreams.push({ song: streamData.song, artist: streamData.artist, albumArt: streamData.song_image_url, time: timeOfDay, timestamp })
        })
        // Sort raw streams chronologically by timestamp string (format is lexicographically sortable)
        rawStreams.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        setAllStreamsRaw(rawStreams)
        calculateTop(allStreams)
    };

    const calculateTop = (allStreams) => {
        const songFrequencyMap = {};
        const artistFrequencyMap = {};
        allStreams.forEach(([song, artist, song_image_url, artist_id, artist_image_url]) => {
            const songKey = `${song}:${artist}`;
            if (songFrequencyMap[songKey]) {
                songFrequencyMap[songKey].count += 1;
            } else {
                songFrequencyMap[songKey] = { count: 1, song, artist, song_image_url, artist_id };
            }
            if (artistFrequencyMap[artist_id]) {
                artistFrequencyMap[artist_id].count += 1;
            } else {
                artistFrequencyMap[artist_id] = { count: 1, artist, artist_id, artist_image_url };
            }
        });

        const sortedSongs = Object.values(songFrequencyMap)
            .sort((a, b) => b.count - a.count)
            .map(({ song, artist, song_image_url, count }) => ({ song, artist, song_image_url, count }));

        const mostFrequentArtist = Object.values(artistFrequencyMap)
            .sort((a, b) => b.count - a.count)
            .map(({ artist, artist_image_url, count }) => [artist, artist_image_url, count])[0]

        setTopSongs(sortedSongs)
        setTopArtist(mostFrequentArtist)
    };

    function switchToPending(userSpotifyEmail) {
        setSpotifyEmailEntered(true)
        setUserSpotifyEmail(userSpotifyEmail)
    }

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
        };
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
            window.location.href = buildFunctionUrl('spotifyAuthorise');
        } catch (error) {
            console.error('Error when authorising user', error);
        }
    };

    const refreshStreamingData = async () => {
        if (refreshCooldown || isRefreshing) return;

        setIsRefreshing(true)
        setRefreshCooldown(true)

        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const refreshFn = httpsCallable(functions, 'refreshUserStreams');
            const result = await refreshFn({ timeZone: userTimeZone });
            if (result.data.success) {
                fetchStreamingData()
            } else {
                console.error('Stream refresh failed :(');
            }
        } catch (error) {
            console.error("Error refreshing streams: ", error)
        } finally {
            setIsRefreshing(false)
            cooldownTimerRef.current = setTimeout(() => setRefreshCooldown(false), REFRESH_COOLDOWN_MS)
        }
    }

    return (
        <div class="outer-spotify-container">
            {!spotifyEmailEntered ? (
                <EmailInput switchToPending={switchToPending}></EmailInput>
            ) : (
                <div class="division-expander">
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
                                        <div className="spotify-controls">
                                            <button
                                                onClick={refreshStreamingData}
                                                className="refresh-button"
                                                disabled={refreshCooldown || isRefreshing}
                                            >
                                                {isRefreshing ? 'Refreshing...' : refreshCooldown ? 'Wait...' : 'Refresh'}
                                            </button>
                                            <div className="view-toggle-container">
                                                <button
                                                    className={`toggle-btn ${viewMode === 'top' ? 'active' : ''}`}
                                                    onClick={() => setViewMode('top')}
                                                >
                                                    Top Songs
                                                </button>
                                                <button
                                                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                                    onClick={() => setViewMode('list')}
                                                >
                                                    All Streams
                                                </button>
                                            </div>
                                        </div>

                                        <div className="primary-layout">
                                            {topSongs == null || topSongs.length == 0 ? (
                                                <div className="no-data-text">
                                                    {streamingDataMsg}
                                                </div>
                                            ) : viewMode === 'top' ? (
                                                <div class="main-text">
                                                    Your top listening on this day
                                                    <div class="gap"></div>

                                                    <TopStreamComponent
                                                        songName={topSongs[0].song}
                                                        artistName={topSongs[0].artist}
                                                        albumArt={topSongs[0].song_image_url}
                                                        topArtist={topArtist[0]}
                                                        artistArt={topArtist[1]}
                                                        artistCount={topArtist[2]}
                                                        count={topSongs[0].count}
                                                    />

                                                    <div className="topsongs-container">
                                                        <div className="song-column">
                                                            {topSongs.slice(1, 6).map((stream, index) => (
                                                                <Song
                                                                    key={index}
                                                                    songName={stream.song}
                                                                    artistName={stream.artist}
                                                                    albumArt={stream.song_image_url}
                                                                    number={index + 2}
                                                                    count={stream.count}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="song-column">
                                                            {topSongs.slice(6, 11).map((stream, index) => (
                                                                <Song
                                                                    key={index}
                                                                    songName={stream.song}
                                                                    artistName={stream.artist}
                                                                    albumArt={stream.song_image_url}
                                                                    number={index + 7}
                                                                    count={stream.count}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="streams-list-container">
                                                    <div class="spotify-section-heading">All streams on this day</div>
                                                    <div class="gap"></div>
                                                    <div className="streams-list">
                                                        {allStreamsRaw.map((stream, index) => (
                                                            <div key={index} className="stream-list-item">
                                                                <span className="stream-time">{stream.time}</span>
                                                                <img src={stream.albumArt} alt={`${stream.song} album art`} className="stream-list-album-art" />
                                                                <div className="stream-list-info">
                                                                    <div className="stream-list-song">{stream.song}</div>
                                                                    <div className="stream-list-artist">{stream.artist}</div>
                                                                </div>
                                                            </div>
                                                        ))}
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
