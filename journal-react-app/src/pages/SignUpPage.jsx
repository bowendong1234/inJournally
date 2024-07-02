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
            <div>
                <SignUp onBackToSignInClick={handleBackToLoginClick} />
            </div>
        </div>
    )
}

export default SignUpPage