const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Use fetch for API requests
const readline = require('readline'); // Use readline to take input from the console

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

const SBDB_API_URL = 'https://ssd-api.jpl.nasa.gov/sbdb.api';

// Helper function to avoid showing N/A
const avoidNA = (value) => (value ? value : 'N/A');

// Function to fetch the object data
const fetchObjectData = async (objectName) => {
  try {
    const apiResponse = await fetch(`${SBDB_API_URL}?sstr=${objectName}`);
    const data = await apiResponse.json();

    // Log the full API response for diagnosis
    console.log('Full API Response:', JSON.stringify(data, null, 2));

    if (data && data.object) {
      // Extract the necessary data from the API response with proper labels
      const result = {
        type: data.object?.des || 'Unknown',
        data: {
          name: avoidNA(data.object?.fullname),
          eccentricity: avoidNA(data.orbit?.e), // Eccentricity (e)
          perihelion_distance: avoidNA(data.orbit?.q), // Perihelion distance (q)
          time_of_perihelion_passage_jd: avoidNA(data.orbit?.tp), // Time of perihelion (Julian day)
          time_of_perihelion_passage_cal: avoidNA(data.orbit?.cd_tp), // Time of perihelion (calendar date/time)
          longitude_of_ascending_node: avoidNA(data.orbit?.om), // Longitude of ascending node (deg)
          argument_of_perihelion: avoidNA(data.orbit?.w), // Argument of perihelion (deg)
          inclination: avoidNA(data.orbit?.i), // Inclination (deg)
          semi_major_axis: avoidNA(data.orbit?.a), // Semi-major axis (au)
          mean_anomaly: avoidNA(data.orbit?.ma), // Mean anomaly (deg)
          orbital_period: avoidNA(data.orbit?.per), // Orbital period (days)
          mean_motion: avoidNA(data.orbit?.n), // Mean motion (deg/day)
          aphelion_distance: avoidNA(data.orbit?.ad), // Aphelion distance (au)
        },
      };

      console.log(result);
    } else {
      console.log(`Object '${objectName}' not found.`);
    }
  } catch (error) {
    console.error('Error fetching data from SBDB:', error);
  }
};

// Create readline interface to ask for input from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask the user for the object name
const askForObjectName = () => {
  rl.question('Enter the astronomical object name to search: ', (objectName) => {
    fetchObjectData(objectName);
    rl.close();
  });
};

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  askForObjectName(); // Prompt for object name when the server starts
});
