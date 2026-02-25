import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EditorPage from './pages/EditorPage';
import PrivateRoute from './PrivateRoute';
import SpotifyAuth from './pages/SpotifyAuth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/spotify/callback" element={<SpotifyAuth />} />
      <Route 
        path="/editor/:date" 
        element={
          <PrivateRoute>
            <EditorPage />
          </PrivateRoute>
        } 
      />
    </Routes>

  );
}

export default App;
