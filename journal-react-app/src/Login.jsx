import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebase } from './Firebase';
import 'firebaseui/dist/firebaseui.css';

const Login = () => {
  const auth = getAuth(firebase);
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // Successfully signed in
        console.log(result.user);
        console.log(result.user.uid);
        localStorage.setItem('userID', result.user.uid);
        navigate('/editor');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEmailSignIn = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        console.log(userCredential.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEmailSignUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        console.log(userCredential.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1>Welcome to inJournally</h1>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <div>
        <h2>Sign in with Email</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;
          handleEmailSignIn(email, password);
        }}>
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div>
        <h2>Sign up with Email</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;
          handleEmailSignUp(email, password);
        }}>
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Login;

