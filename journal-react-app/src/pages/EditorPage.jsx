import React, { useState, useEffect, useRef } from 'react'
import Editor from '../components/Editor.jsx'
import './EditorPage.css'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar';
import dayjs from 'dayjs';
import Spotify from '../components/Spotify.jsx'

const EditorPage = () => {
    console.log("editor page rendered")
    const navigate = useNavigate();
    const editorRef = useRef()
    const { date } = useParams();
    console.log(date)

    useEffect(() => {
        console.log("use effect triggered")
        if (!date || date=="redirect") {
          const today = dayjs().format('YYYY-MM-DD');
          console.log("here")
          console.log(today)
          navigate(`/editor/${today}`);
        }
    }, [date, navigate]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.loadData();
        }
    }, [date]);
  
    const handleSaveOnDateChange = () => {
        if (editorRef.current) {
            // editorRef.current.handleSave();
        }
        
    }

    const handleLoadOnDateChange = () => {
        if (editorRef.current) {
            console.log(date);
            editorRef.current.loadData();
        }
        
    }

    return (
        <div class="background">
            <TopBar handleSaveOnDateChange={handleSaveOnDateChange}/>
            <div class="topbar-to-contents-container">
                <Editor ref={editorRef}/>
                <div class="right-column-container">
                    <Spotify></Spotify>
                </div>

            </div>
        </div>
    )
}

export default EditorPage