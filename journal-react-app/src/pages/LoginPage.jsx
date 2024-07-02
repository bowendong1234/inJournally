import React, { useState } from 'react'
import Login from '../components/Login.jsx'
import './LoginPage.css'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
    // const [showSignIn, setShowSignIn] = useState(true);
    // const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignUpClick = () => {
    //   setShowSignIn(false);
        navigate('/signup');
    };
  
    const handleForgotPasswordClick = () => {
        navigate('/forgotpassword');
      };

    // const handleBackToLoginClick = () => {
    //   setShowSignIn(true);
    //   if (showForgotPassword) {
    //     setShowForgotPassword(false);
    //   }
    // };

    return (
        <div class="background">
            <Login onSignUpClick={handleSignUpClick} onForgotPasswordClick={handleForgotPasswordClick}/>
            {/* <div>
                {showSignIn ? (
                    <Login onSignUpClick={handleSignUpClick} onForgotPasswordClick={handleForgotPasswordClick}/>
                ) : (
                    <div>
                        {showForgotPassword ? (
                            <ForgotPassword onBackToSignInClick={handleBackToLoginClick} />
                        ) : (
                            <SignUp onBackToSignInClick={handleBackToLoginClick} />
                        )}
                    </div>

                )}
            </div> */}
        </div>
    )
}

export default LoginPage