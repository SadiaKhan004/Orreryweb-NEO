// // src/Orrery.js
// import React, { useEffect, useState } from 'react';

// function Orrery() {
//   const [objects, setObjects] = useState([]);

//   useEffect(() => {
//     const fetchObjects = async () => {
//       const response = await fetch('http://localhost:5000/objects'); // Adjust this endpoint in your server
//       const data = await response.json();
//       setObjects(data);
//     };

//     fetchObjects();
//   }, []);

//   const handleClick = (name) => {
//     alert(`You clicked on ${name}`); // Replace with your zoom functionality
//   };

//   return (
//     <div>
//       <h1>Orrery Visualization</h1>
//       <div className="orrery-container">
//         {objects.map((obj) => (
//           <div
//             key={obj.name}
//             className="orrery-object"
//             style={{
//               width: '50px',
//               height: '50px',
//               backgroundColor: getRandomColor(),
//               display: 'inline-block',
//               position: 'relative',
//               margin: '10px',
//               borderRadius: '50%',
//             }}
//             onClick={() => handleClick(obj.name)}
//           >
//             <span style={{
//               position: 'absolute',
//               top: '-20px',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               fontSize: '14px',
//               display: 'none' // Initially hidden; make it visible on click
//             }}>{obj.name}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// const getRandomColor = () => {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// };

// export default Orrery;
