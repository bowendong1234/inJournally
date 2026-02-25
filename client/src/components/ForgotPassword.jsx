import React, { useState } from 'react';
import { auth } from '../Firebase.jsx';
import { sendPasswordResetEmail } from 'firebase/auth';
import "./Login.css"

const ForgotPassword = ( {onBackToSignInClick} ) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox.');
      setError(false);
    } catch (error) {
      setMessage('Something went wrong :( Please ensure the email you entered is correct');
      setError(true)
    }
  };

  return (
    <div class="login-container">
      <div class="sign-in-heading">
          Forgot Password?
      </div>
      <div class="form-container">
      <div class={error? 'form-field-error' : 'form-field'}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
      </div>
      <button class="form-button" onClick={handlePasswordReset}>Send Password Reset Email</button>
      {error ? (
        <div class="sign-in-error-messages">
          {message}
        </div>
        ) : (
          <div></div>
        )}
      <button onClick={onBackToSignInClick} class="go-back-to-sign-in-button">Go back to sign in</button>
      </div>
    </div>
  );
};

export default ForgotPassword;
