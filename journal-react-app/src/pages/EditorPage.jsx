import React, { useState } from 'react'
import Editor from '../components/Editor.jsx'
import './EditorPage.css'
import { useNavigate } from 'react-router-dom'

const EditorPage = () => {
    // const [showSignIn, setShowSignIn] = useState(true);
    // const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignUpClick = () => {
    //   setShowSignIn(false);
        navigate('/signup');
    };
  

    return (
        <div class="background">
            <Editor />
        </div>
    )
}

export default EditorPage