import React from 'react';
import { BrowserRouter as Router, Route, Switch, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Editor from './Editor.jsx';

const isAuthenticated = () => {
  // Implement your authentication logic here, e.g., check if a token is stored in localStorage
  return localStorage.getItem('userID') !== null;
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Navigate to="/login" />
      )
    }
  />
);

const AppRouter = () => (
  <Router>
    <Switch>
      <Route path="/login" component={Login} />
      <PrivateRoute path="/home" component={Editor} />
      <Redirect from="/" to="/login" />
    </Switch>
  </Router>
);

export default AppRouter;
