import React, { useState } from 'react';
import { auth } from '../Firebase.jsx';
import { sendPasswordResetEmail } from 'firebase/auth';
import "./Login.css"

const ForgotPassword = ( {onBackToSignInClick} ) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div class="login-container">
      <div class="text-container">
        <div class="sign-in-heading">
            Forgot Password?
        </div>
        <div class="sign-in-sub-heading">
            Enter your email to reset your password
        </div>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={handlePasswordReset}>Send Password Reset Email</button>
      {message && <p>{message}</p>}
      <button onClick={onBackToSignInClick}>Go back to sign in</button>
    </div>
  );
};

export default ForgotPassword;
