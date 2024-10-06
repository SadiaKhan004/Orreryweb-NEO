


import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import KeplerOrbitSimulation from './OrbitSimulator';

function App() {
  return (
    <div>
      <h1>Astronomical Object Search</h1>

      {/* Navigation bar */}
      

      {/* Render the KeplerOrbitSimulation component */}
      <KeplerOrbitSimulation />
    </div>
  );
}

export default App;
