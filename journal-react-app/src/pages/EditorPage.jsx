import React, { useState, useEffect } from 'react'
import Editor from '../components/Editor.jsx'
import './EditorPage.css'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar';

const EditorPage = () => {
    const navigate = useNavigate();
    const { date } = useParams();

    useEffect(() => {
        if (!date) {
          const today = dayjs().format('YYYY-MM-DD');
          navigate(`/editor/${today}`);
        }
    }, [date, navigate]);
  

    return (
        <div class="background topbar-to-contents-container">
            <TopBar />
            <Editor />
            {/* <div class="topbar-to-contents-container">
                <TopBar />
                <Editor />
            </div> */}
        </div>
    )
}

export default EditorPage