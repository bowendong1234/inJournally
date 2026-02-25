import React, { useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext"
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from "../Firebase"
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SpotifyAuth = () => {
    const navigate = useNavigate();
    const today = dayjs().format('YYYY-MM-DD')
    const { currentUser } = useAuth();
    

    const saveSpotifyTokens = async (data) => {
        try {
            const uid = localStorage.getItem('userID')
            const { access_token, refresh_token, expires_in } = data; 


            if (!uid) {
                throw new Error("User ID is undefined.");
            }

            const docPath = `Users/${uid}`;
            const userRef = doc(db, docPath);

            const expiration_time = Date.now() + (expires_in - 10) * 1000;
            const user_time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone

            await updateDoc(userRef, {
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
                tokenExpiresAt: expiration_time,
                userTimeZone: user_time_zone
            });

            // Navigate after saving to Firestore
            navigate(`/editor/${today}`);

        } catch (error) {
            console.error("Error saving tokens to Firebase:", error);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code'); // Get the authorization code from URL

        if (code) {
            // Call the backend with the authorization code
            fetch(`${API_BASE_URL}/spotify/callback?code=${code}`)
                .then(response => response.json())
                .then(data => {
                    saveSpotifyTokens(data)
                })
                .catch(err => console.error("Error fetching access token:", err));
        }
        
    }, []); // Empty dependency array to run once on mount

    return (
        <div>
            <h1>Spotify Authorisation Loading...</h1>
        </div>
    );
};

export default SpotifyAuth;
