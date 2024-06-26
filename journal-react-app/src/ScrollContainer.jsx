// ScrollContainer.jsx
import React from 'react';
import './ScrollContainer.css';

const ScrollContainer = ({ children }) => {
  return (
    <div className="scroll-container">
      {children}
    </div>
  );
};

export default ScrollContainer;
