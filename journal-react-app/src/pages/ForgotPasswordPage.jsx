import React, { useState } from 'react'
import ForgotPassword from '../components/ForgotPassword.jsx'
import './LoginPage.css'
import { useNavigate } from 'react-router-dom'

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const handleBackToLoginClick = () => {
        navigate('/');
    };

    return (
        <div class="background">
            <ForgotPassword onBackToSignInClick={handleBackToLoginClick} />
        </div>
    )
}

export default ForgotPasswordPage