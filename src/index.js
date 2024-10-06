// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './Main'; // Change this to import Main
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main /> {/* Render Main instead of App */}
  </React.StrictMode>
);

reportWebVitals();
