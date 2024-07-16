import React, { useState, useEffect } from 'react'
import Editor from '../components/Editor.jsx'
import './EditorPage.css'
import { useParams, useNavigate } from 'react-router-dom'

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
        <div class="background">
            <Editor />
        </div>
    )
}

export default EditorPage