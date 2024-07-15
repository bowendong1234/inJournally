import { useNavigate } from 'react-router-dom'
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { firebase } from '../Firebase';
import 'firebaseui/dist/firebaseui.css';
import './Login.css';
import './FormStyles.css';


const GoogleSignInButton = () => {
  const auth = getAuth(firebase);
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // Successfully signed in
        console.log(result.user);
        console.log(result.user.uid);
        // localStorage.setItem('userID', result.user.uid);
        navigate('/editor');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
      <button className="google-sign-in-button" onClick={handleGoogleSignIn}>
          <img src="/images/google_logo.webp" alt="Google Logo" className="google-logo" />
          Continue with Google
      </button>
  );
};

const SignUp = ( { onBackToSignInClick }) => {
  const auth = getAuth(firebase);
  const navigate = useNavigate();

  const handleEmailSignUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log(userCredential.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div class="login-container">
      <div class="sign-in-heading">
        Sign up
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
      </div>
      <div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = e.target.email.value;
          const password = e.target.password.value;
          handleEmailSignUp(email, password);
        }}>
        <div class="form-container">
            <div class="form-field">
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div class="form-field">
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <div>
              <button type="submit" class="form-button">Sign Up</button>
            </div>
            <button onClick={onBackToSignInClick} class="go-back-to-sign-in-button">Go back to sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

