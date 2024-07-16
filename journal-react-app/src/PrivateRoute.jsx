import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  console.log("Current User in PrivateRoute:", currentUser);

  if (loading) {
    console.log("Loading authentication state...");
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    console.log("No user found, redirecting to sign in");
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
