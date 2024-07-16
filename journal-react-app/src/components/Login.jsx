import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { firebase } from '../Firebase';
import 'firebaseui/dist/firebaseui.css';
import './Login.css';
import './FormStyles.css';
import { useAuth } from '../contexts/AuthContext';

// TODO: might wanna rename all the 'login' stuff to 'sign in'

const GoogleSignInButton = () => {
  const auth = getAuth(firebase);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const today = dayjs().format('YYYY-MM-DD')

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // Successfully signed in
        console.log(result.user);
        console.log(result.user.uid);
        setCurrentUser(result.user);
        // localStorage.setItem('userID', result.user.uid);
        navigate('/editor/${today}');
      })
      .catch((error) => {
        console.error(error);
      });
  };


  return (
      <button className="google-sign-in-button" onClick={handleGoogleSignIn}>
          <img src="/images/google_logo.webp" alt="Google Logo" className="google-logo" />
          Sign in with Google
      </button>
  );
};


const Login = ( { onSignUpClick, onForgotPasswordClick}) => {
  const auth = getAuth(firebase);
  const navigate = useNavigate();
  const [signInError, setSignInError] = useState(false);
  const [showInvalidCredential, setShowInvalidCredential] = useState(false);
  const [showInvalidPassword, setShowInvalidPassword] = useState(false);


  const handleEmailSignIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
        navigate('/editor');
      })
      .catch((error) => {
        setSignInError(true)
        if (error.code == "auth/invalid-credential") {
          setShowInvalidCredential(true);
          setShowInvalidPassword(false);
        } else if (error.code =="auth/wrong-password") {
          setShowInvalidPassword(true);
          setShowInvalidCredential(false);
        }
        console.error(error);
      });
  };

  return (
    <div class="login-container">
      {/* <div class="text-container">
        <img src="/images/inJournally_logo.png" alt="inJournally Logo" className="google-logo" />
      </div> */}
      <div class="sign-in-heading">
        Login
      </div>
      <div class="google-sign-in-container">
        <GoogleSignInButton />
      </div>
      <div>
        <div class="separator-container">
          <div class="email-sign-in-heading">
            <div class="separator">
              <span>
                OR
              </span>
            </div>
          </div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;
          handleEmailSignIn(email, password);
        }}>
          <div class="form-container">
            <div class={signInError? 'form-field-error' : 'form-field'} id="emailForm">
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div class={signInError? 'form-field-error' : 'form-field'} id="passwordForm">
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <div>
              <button type="submit" class="form-button">Login</button>
            </div>
          </div>
        </form>
      </div>
        {signInError ? (
          <div>
            {showInvalidCredential ? (
                <div class="sign-in-error-messages">
                  The email you have entered is not associated with an account
                </div>
              ) : (
                <div class="sign-in-error-messages">
                  Incorrect password
                </div>
              )}
          </div>
          ) : (
              <div></div>
          )}
      <div class="forgot-password">
        <button class="forgot-password-button" onClick={onForgotPasswordClick}>Forgot password?</button>
      </div>
      <div class="dont-have-account">
        Don't have an account?
        <button onClick={onSignUpClick} class="new-here-button">Sign up</button>
      </div>
    </div>
  );
}

export default Login;

