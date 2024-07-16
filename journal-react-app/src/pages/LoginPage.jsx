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
            <Login onSignUpClick={handleSignUpClick} onForgotPasswordClick={handleForgotPasswordClick}/>
        </div>
    )
}

export default LoginPage