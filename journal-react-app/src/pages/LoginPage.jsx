import React, { useState } from 'react'
import Login from '../components/Login.jsx'
import './LoginPage.css'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
    const navigate = useNavigate();

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    const handleForgotPasswordClick = () => {
        navigate('/forgotpassword');
    };


    return (
        <div class="background">
            <div class="text-container">
                <div class="heading">Welcome to inJournally</div>
                <div class="subheading">Capture your day in words and discover its soundtrack by connecting your Spotify account!</div>
                <div class="notice">Heads up! inJournally is currently awaiting extension approval from Spotify. If you'd like to use the
                    music tracking feature, it may take up to 36 hours for your streaming data to start being collected.</div>

            </div>
            <Login onSignUpClick={handleSignUpClick} onForgotPasswordClick={handleForgotPasswordClick} />
        </div>
    )
}

export default LoginPage