import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EditorPage from './pages/EditorPage';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route 
        path="/editor" 
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
// import React from 'react';
// import Editor from './Editor.jsx';
// import Login from './Login.jsx';
// import ScrollContainer from './ScrollContainer.jsx';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// const containerStyle = {
//   backgroundColor: 'white',
//   borderRadius: '10px',
//   padding: '20px',
//   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//   height: '80vh',
//   maxWidth: '300vh',
//   margin: '10px',
//   overflowY: 'auto',
// };

// const App = () => {

//   return (
//     <div style={containerStyle}>
//       <div className="App">
//         <ScrollContainer>
//           <h2>hello</h2>
//           <Editor />
//         </ScrollContainer>
//       </div>
//     </div>
//   );
// };

// export default App;
