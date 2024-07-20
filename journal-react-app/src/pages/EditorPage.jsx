import React, { useState, useEffect, useRef } from 'react'
import Editor from '../components/Editor.jsx'
import './EditorPage.css'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar';

const EditorPage = () => {
    const navigate = useNavigate();
    const editorRef = useRef()
    const { date } = useParams();

    useEffect(() => {
        if (!date) {
          const today = dayjs().format('YYYY-MM-DD');
          navigate(`/editor/${today}`);
        }
    }, [date, navigate]);
  
    const handleSaveOnDateChange = () => {
        if (editorRef.current) {
            editorRef.current.handleSave();
            editorRef.current.loadData();
        }
        
    }

    return (
        <div class="background">
            <TopBar handleSaveOnDateChange={handleSaveOnDateChange}/>
            <div class="topbar-to-contents-container">
                <Editor ref={editorRef}/>
            </div>
        </div>
    )
}

export default EditorPage