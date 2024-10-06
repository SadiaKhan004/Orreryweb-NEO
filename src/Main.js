// // src/Main.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import App from './App'; // Your existing search component
// import Orrery from './orreryvisual'; // New component
// // import AsteroidData from './AteroidData';
// import EllipticalSimulator from './EllipticalSimulator';

// function Main() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<App />} />
//         <Route path="/orrery" element={<Orrery />} />
//       </Routes>
//     </Router>
//   );
// }

// export default Main;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App'; // Your existing search component
import OrbitSimulator from './OrbitSimulator'; // Import the EllipticalSimulator component


function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/elliptical-simulator" element={<OrbitSimulator />} /> New route for Elliptical Simulator
      </Routes>
    </Router>
  );
}

export default Main;
