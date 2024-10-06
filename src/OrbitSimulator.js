
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import asteroidImage from './asteroid.png'; // Ensure this path is correct
import sunImage from './sun.png'; // Import your sun.gif here
// import backgroundImage from './background.jpg'; // Import the background image here
// import Orrery from './planetsorrey';
import Mars from './mars.png';
import mercury from './mercury.png';
import earth from './earth.png';
import venus from './venus.png';
import jupiter from './jupiter.png';
import saturn from './saturn.png';
import uranus from './uranus.png';
import neptune from './neptune.png';
import { Wireframe } from 'three-stdlib';

import background from './background1.jpeg'

const KeplerOrbitSimulation = () => {
  const mountRef = useRef(null);
  const [asteroids, setAsteroids] = useState([]);
  const [numAsteroids, setNumAsteroids] = useState(15);
  const [inputValue, setInputValue] = useState(numAsteroids);
  const [objectName, setObjectName] = useState('');

  const [showHazardous, setShowHazardous] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const rotationSpeed = 0.00001; // Rotation speed


  const orbitLines = [];
  const cameraRef = useRef();
  const initialFov = 20;
  const fovChangeSpeed = 0.1;
  // const handleSearch = async () => {
  //   setError('');
  //   setResult(null);

  //   try {
  //     const response = await fetch(`http://localhost:5000/search?name=${objectName}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       setResult(data); // Set the result to the asteroid data
  //     } else {
  //       setError('Object not found');
  //     }
  //   } catch (err) {
  //     setError('An error occurred while fetching data.');
  //   }
  // };

  const keplerSolve = (e, M) => {
    let E = M;
    const tolerance = 1e-6;
    let deltaE;

    do {
      deltaE = (M - (E - e * Math.sin(E)));
      E += deltaE;
    } while (Math.abs(deltaE) > tolerance);

    return E;
  };

  const propagate = (clock, a, e, T) => {
    const n = (2 * Math.PI) / T;
    const M = n * clock;
    const E = keplerSolve(e, M);
    const cose = Math.cos(E);
    const r = a * (1 - e * cose);
    const x = r * (Math.cos(E) - e);
    const y = r * (Math.sqrt(1 - e ** 2) * Math.sin(E));

    return new THREE.Vector3(x, y, 0);
  };

  const handleSearch = async () => {
    setError('');
    setResult(null);
    setAsteroids([]); // Clear existing asteroids
    orbitLines.forEach(({ line }) => {
      if (line) line.geometry.dispose(); // Dispose of the orbit line geometry
    });
    orbitLines.length = 0; // Clear the orbitLines array

    try {
      const response = await fetch(`http://localhost:5000/search?name=${objectName}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setResult(data);
          renderAsteroid(data); // Render the new asteroid
        } else {
          setError('Object not found');
        }
      } else {
        setError('Object not found');
      }
    } catch (err) {
      setError('An error occurred while fetching data.');
    }
  };



  const renderAsteroid = (asteroidData) => {
    const scene = mountRef.current.scene; // Access the scene
    const { semiMajorAxis, eccentricity, orbitalPeriod } = asteroidData;

    const orbitPoints = [];
    const numPoints = 1440;
    const totalOrbitTime = orbitalPeriod;

    for (let clock = 0; clock <= totalOrbitTime; clock += totalOrbitTime / numPoints) {
      const position = propagate(clock, semiMajorAxis, eccentricity, orbitalPeriod);
      orbitPoints.push(position);
    }

    const orbitLineGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
    orbitLines.push({ line: orbitLine }); // Store the orbit line for potential removal
    scene.add(orbitLine);

    const asteroidGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const textureLoader = new THREE.TextureLoader();
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load(asteroidImage) });
    const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    const position = propagate(0, semiMajorAxis, eccentricity, orbitalPeriod); // Set initial position
    asteroidMesh.position.set(position.x, position.y, 0);
    scene.add(asteroidMesh);
    setAsteroids([asteroidMesh]); // Update asteroids state
  };


  useEffect(() => {
    const mainDiv = mountRef.current;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(initialFov, 900 / 600, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(900, 600);
    renderer.setClearColor(0x000000);
    mainDiv.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
   


    const addPlanetsToScene = (scene) => {
      const textureLoader = new THREE.TextureLoader();

      // Load planet textures
      const mercuryTexture = textureLoader.load(mercury);
      const venusTexture = textureLoader.load(venus);
      const earthTexture = textureLoader.load(earth);
      const marsTexture = textureLoader.load(Mars);
      const jupiterTexture = textureLoader.load(jupiter);
      const saturnTexture = textureLoader.load(saturn);
      const uranusTexture = textureLoader.load(uranus);
      const neptuneTexture = textureLoader.load(neptune);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust light intensity
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Add directional light
      directionalLight.position.set(5, 5, 5); // Set light position
      scene.add(directionalLight);


      // Planets array with textures instead of colors
      const planets = [
        { name: 'Mercury', semiMajorAxis: 0.39, eccentricity: 0.2056, orbitalPeriod: 0.24, texture: mercuryTexture },
        { name: 'Venus', semiMajorAxis: 0.72, eccentricity: 0.0068, orbitalPeriod: 0.6152, texture: venusTexture },
        { name: 'Earth', semiMajorAxis: 1.00, eccentricity: 0.0167, orbitalPeriod: 1.0, texture: earthTexture },
        { name: 'Mars', semiMajorAxis: 1.52, eccentricity: 0.0934, orbitalPeriod: 1.881, texture: marsTexture },
        { name: 'Jupiter', semiMajorAxis: 5.20, eccentricity: 0.0489, orbitalPeriod: 11.86, texture: jupiterTexture },
        { name: 'Saturn', semiMajorAxis: 9.58, eccentricity: 0.0565, orbitalPeriod: 29.46, texture: saturnTexture },
        { name: 'Uranus', semiMajorAxis: 19.22, eccentricity: 0.0464, orbitalPeriod: 84.01, texture: uranusTexture },
        { name: 'Neptune', semiMajorAxis: 30.05, eccentricity: 0.0086, orbitalPeriod: 164.8, texture: neptuneTexture },
      ];

      // Define an array of colors for the planet orbits
      const orbitColors = [
        0xff0000, // Red for Mercury
        0xffa500, // Orange for Venus
        0x0000ff, // Blue for Earth
        0x00ff00, // Green for Mars
        0xffff00, // Yellow for Jupiter
        0x800080, // Purple for Saturn
        0x00ffff, // Cyan for Uranus
        0xff69b4, // HotPink for Neptune
        // Add more colors if needed
      ];

      // Use a thicker line for orbits
      const orbitThickness = 0.02; // Adjust thickness here


      planets.forEach(({ name, semiMajorAxis, eccentricity, orbitalPeriod, texture }, index) => {
        // Calculate orbit points for the planets
        const orbitPoints = [];
        const numPoints = 1440;
        const totalOrbitTime = orbitalPeriod;

        for (let clock = 0; clock <= totalOrbitTime; clock += totalOrbitTime / numPoints) {
          const position = propagate(clock, semiMajorAxis, eccentricity, orbitalPeriod);
          orbitPoints.push(position);
        }

        // Create the orbit line for the planet
        const orbitLineGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);

        // Use the color from the orbitColors array based on the planet index
        const orbitLineMaterial = new THREE.LineBasicMaterial({ color: orbitColors[index % orbitColors.length] });

        const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
        scene.add(orbitLine); // Add the planet's orbit line to the scene


        // Create the planet mesh
        const planetGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const planetMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.FrontSide, // Ensures both sides are visible

          transparent: false, // Set transparent to false
          opacity: 1 // Set opacity to 1
        });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        const fixedClock = index * (totalOrbitTime / planets.length); // Adjust the clock for each planet
        const position = propagate(fixedClock, semiMajorAxis, eccentricity, orbitalPeriod);
        planetMesh.position.set(position.x, position.y, 0);
        scene.add(planetMesh); // Add the planet mesh to the scene
        const createPlanet = (texture) => {
          const geometry = new THREE.SphereGeometry(0.01, 32, 32);
          const material = new THREE.MeshStandardMaterial({ map: texture });
          return new THREE.Mesh(geometry, material);
        };

        const createTextSprite = (text) => {
          // Implement this function to create a sprite with the given text
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          context.font = '8px Arial';
          context.fillStyle = 'white';
          context.fillText(text, 60, 30); // Adjust position as necessary
          const texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;

          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          return sprite;
        }
        const planetTextSprite = createTextSprite(name); // Ensure this function is defined
        planetTextSprite.position.set(position.x + 0.3, position.y - 1, 0);
        scene.add(planetTextSprite); // Add planet text sprite to the scene
      });

    };
    addPlanetsToScene(scene);




    const sunTextureLoader = new THREE.TextureLoader();
    sunTextureLoader.load(sunImage, (texture) => {
      const sunGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Adjust radius and detail as needed
      const sunMaterial = new THREE.MeshBasicMaterial({ map: texture }); // Remove transparent: true
      const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
      sunMesh.position.set(-0.07, 0, 0);
      scene.add(sunMesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const fetchAsteroids = async () => {
      try {
        const response = await fetch('http://localhost:5000/elliptical');
        const data = await response.json();

        const newAsteroids = data
          .sort(() => 0.5 - Math.random())
          .slice(0, numAsteroids)
          .map((asteroid) => ({
            name: asteroid.name,
            semiMajorAxis: asteroid.semiMajorAxis,
            eccentricity: asteroid.eccentricity,
            orbitalPeriod: asteroid.orbitalPeriod,
            is_potentially_hazardous_asteroid: asteroid.is_potentially_hazardous_asteroid,
          }));

        addAsteroidsToScene(newAsteroids);
      } catch (error) {
        console.error('Error fetching asteroids:', error);
      }
    };

    const addAsteroidsToScene = (newAsteroids) => {

      const textureLoader = new THREE.TextureLoader();
      const filteredAsteroids = showHazardous
        ? newAsteroids.filter(asteroid => asteroid.is_potentially_hazardous_asteroid)
        : newAsteroids;

      filteredAsteroids.forEach(({ name, semiMajorAxis, eccentricity, orbitalPeriod }, index) => {
        const orbitPoints = [];
        const numPoints = 1440;
        const totalOrbitTime = orbitalPeriod;

        for (let clock = 0; clock <= totalOrbitTime; clock += totalOrbitTime / numPoints) {
          const position = propagate(clock, semiMajorAxis, eccentricity, orbitalPeriod);
          orbitPoints.push(position);
        }

        const orbitLineGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
        orbitLines.push({ line: orbitLine, originalColor: 0xffffff });
        scene.add(orbitLine);

        const createTextSprite = (text) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          context.font = '8px Arial';
          context.fillStyle = 'white';
          context.fillText(text, 60, 30);
          const texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;
    
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          return sprite;
        };
        const animate = () => {
          requestAnimationFrame(animate);
    
          // Rotate the entire scene around the Y-axis
          scene.rotation.y += rotationSpeed; // Rotate around Y-axis
          renderer.render(scene, camera);
        };
        
        animate();
    

        textureLoader.load(asteroidImage, (texture) => {
          const imageSize = 0.1;
          const asteroidGeometry = new THREE.PlaneGeometry(imageSize, imageSize);
          const asteroidMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
          const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

          const fixedClock = index * 30;
          const position = propagate(fixedClock, semiMajorAxis, eccentricity, orbitalPeriod);
          asteroidMesh.position.set(position.x, position.y, 0);
          asteroidMesh.lookAt(camera.position);
          scene.add(asteroidMesh);

          asteroidMesh.userData = { originalY: asteroidMesh.position.y, name: name };

          const asteroidTextSprite = createTextSprite(name);
          asteroidTextSprite.position.set(position.x+0.3, position.y-1.5, 0);
          scene.add(asteroidTextSprite);

        });
      });

      setAsteroids(newAsteroids);
    };

    fetchAsteroids();

    // camera.position.set(-2, -10, -5);
    // camera.lookAt(new THREE.Vector3(-15,20, 0));
    camera.position.set(0, -70, 15);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / 900) * 2 - 1;
      mouse.y = -(event.clientY / 600) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      orbitLines.forEach(({ line, originalColor }) => {
        line.material.color.set(originalColor);
      });
    };

    const onMouseWheel = (event) => {
      event.preventDefault(); // Prevent default scroll behavior
      const zoomSpeed = 0.5; // Adjust this value to control zoom speed
      const minFov = 1; // Minimum field of view
      const maxFov = 75; // Maximum field of view

      // Update the field of view based on the wheel event
      camera.fov += event.deltaY * zoomSpeed;

      // Clamp the fov value within min and max limits
      camera.fov = THREE.MathUtils.clamp(camera.fov, minFov, maxFov);

      // Update the camera's projection matrix after changing fov
      camera.updateProjectionMatrix();
    };


    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onMouseWheel, { passive: false });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onMouseWheel);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [numAsteroids, showHazardous]);

  const toggleHazardous = () => {
    setShowHazardous((prev) => !prev);
    setNumAsteroids(inputValue); // Reset the number of asteroids to the input value when toggling
  };

  return (

    <div>
      <div ref={mountRef} />
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
        <label>
          Number of Asteroids:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Math.max(1, Math.min(1400, e.target.value)))}
          />
        </label>
        <button className='update' onClick={() => setNumAsteroids(inputValue)}>Update Asteroids</button>
        <button className='hazardous' onClick={toggleHazardous}>
          {showHazardous ? 'Show All Asteroids' : 'Hazardous Asteroids'}
        </button>
      </div>
      <input
        type="text"
        value={objectName}
        onChange={(e) => setObjectName(e.target.value)}
        placeholder="Enter object name"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Display error message if any */}
      {error && <p>{error}</p>}

      {/* Display the result if found */}
      {result && (
        <div>
          <h2>{result.type}: {result.data.name}</h2>
          <p>Orbital Period: {result.data.orbital_period} years</p>
          <p>Eccentricity: {result.data.eccentricity}</p>
          <p>Perihelion: {result.data.perihelion} AU</p>
          <p>Aphelion: {result.data.aphelion} AU</p>
          <p>Inclination: {result.data.inclination} degrees</p>

          {/* Show Mean Anomaly if it's a comet */}
          {result.type === 'Comet' && (
            <p>Mean Anomaly: {result.data.mean_anomaly} degrees</p>
          )}
        </div>
      )}

      <div className='Canva'>
        {/* If result exists, pass the data to KeplerOrbitSimulation */}
        {/* <KeplerOrbitSimulation searchedObject={result ? result.data : null} /> */}
        {/* Render the 3D scene here */}
        <div ref={mountRef} />
      </div>
    </div>
  );
};
export default KeplerOrbitSimulation;


