import { useState } from "react";
import "./EmailInput.css";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from "../Firebase"

const EmailInput = ({switchToPending}) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isValid, setIsValid] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = () => {
        if (validateEmail(email)) {
            setError("");
            setIsValid(true);
        } else {
            setError("Please enter a valid email address.");
            setIsValid(false);
        }
    };

    const handleConfirm = async () => {
        console.log("Email confirmed:", email);
        const uid = localStorage.getItem("userID")
        const docRef = doc(db, `Users/${uid}`)
        const userDoc = await getDoc(docRef)
        if (userDoc.exists()) {
            await updateDoc(doc(db, `Users/${uid}`), { emailEntered: true, spotifyAccountEmail: email })
        }
        switchToPending(email)
    };

    return (
        <div className="email-container">
            <div class="email-input-heading">
                Spotify Tracking
            </div>
            <div class="email-input-subheading">
                Heads up! inJournally is currently awaiting extension approval from Spotify. If you'd like to use this
                music tracking feature, please enter the email associated with your Spotify account in the field below.
                Once approved, you will be able to authenticate with Spotify and see your streaming data! Please note,
                this process may take up to 36 hours.
            </div>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
            />
            <button onClick={handleSubmit} className="submit-button">
                Submit
            </button>
            {error && <p className="error-message">{error}</p>}
            {isValid && (
                <div className="confirmation-box">
                    <p>Is this email correct? <strong>{email}</strong></p>
                    <button onClick={handleConfirm} className="confirm-button">
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}

export default EmailInput;