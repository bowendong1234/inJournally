import React, { useState } from 'react'
import SignUp from '../components/SignUp.jsx'
import './LoginPage.css'
import { useNavigate } from 'react-router-dom'

const SignUpPage = () => {
    const navigate = useNavigate();

    const handleBackToLoginClick = () => {
        navigate('/');
    };

    return (
        <div class="background">
            <SignUp onBackToSignInClick={handleBackToLoginClick} />
        </div>
    )
}

export default SignUpPage