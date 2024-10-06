
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'OrbitXplorer';
const neaCollection = 'NEA';
const necCollection = 'NEC';

// Function to get the current Julian date
const getCurrentJulianDate = () => {
  const now = new Date();
  const julianDate = (now.getTime() / 86400000) + 2440587.5; // Convert to Julian date
  return julianDate;
};
const calculateMeanAnomaly = (data, currentJulianDate) => {
  // Check if necessary data is available
  if (!data.p_yr || !data.tp_tdb) {
      return 'N/A'; // Return 'N/A' if data is missing
  }

  // Convert p_yr to orbital period in days
  const P = Number(data.p_yr) * 365.25; // Convert orbital period from years to days

  const T = Number(data.tp_tdb); // Time of perihelion passage (epoch)

  const timeSincePerihelion = currentJulianDate - T; // Time since perihelion passage

  // Calculate mean anomaly in radians
  const M = (2 * Math.PI) * (timeSincePerihelion / P);

  // Convert to degrees and normalize to the range [0, 360)
  const meanAnomalyDegrees = (M * (180 / Math.PI)) % 360;

  return meanAnomalyDegrees;
};


// Function to calculate the semi-major axis
const calculateSemiMajorAxis = (data) => {
  const q = data.q_au_1; // Perihelion distance
  const e = data.e; // Eccentricity

  if (!q || !e) {
    return 'N/A'; // Return 'N/A' if data is missing
  }

  // Calculate the semi-major axis using the formula a = q / (1 - e)
  const a = q / (1 - e);
  return a;
};

// Search endpoint
app.get('/search', async (req, res) => {
  const objectName = req.query.name;
  let client;

  try {
    client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);

    const neaResult = await db.collection(neaCollection).findOne({ name: { $regex: objectName, $options: 'i' } });
    const necResult = await db.collection(necCollection).findOne({ object_name: { $regex: objectName, $options: 'i' } });

    const currentJulianDate = getCurrentJulianDate(); // Get current Julian date

    if (neaResult) {
      res.send({
        type: 'Asteroid',
        data: {
          name: neaResult.name,
          average_diameter: neaResult.estimated_diameter.kilometers
            ? `${(neaResult.estimated_diameter.kilometers.max + neaResult.estimated_diameter.kilometers.min) / 2} km`
            : 'N/A',
          orbital_period: neaResult.orbital_data.orbital_period || 'N/A',
          eccentricity: neaResult.orbital_data.eccentricity || 'N/A',
          perihelion: neaResult.orbital_data.perihelion_distance || 'N/A',
          aphelion: neaResult.orbital_data.aphelion_distance || 'N/A',
          inclination: neaResult.orbital_data.inclination || 'N/A',
        },
      });
    } else if (necResult) {
      // Calculate mean anomaly and semi-major axis for comets
      const meanAnomaly = calculateMeanAnomaly(necResult, currentJulianDate);
      const semiMajorAxis = calculateSemiMajorAxis(necResult);

      res.send({
        type: 'Comet',
        data: {
          name: necResult.object_name,
          average_diameter: 'N/A', // Update if you have diameter info for comets
          orbital_period: necResult.p_yr || 'N/A',
          eccentricity: necResult.e || 'N/A',
          perihelion: necResult.q_au_1 || 'N/A',
          aphelion: necResult.q_au_2 || 'N/A',
          inclination: necResult.i_deg || 'N/A',
          mean_anomaly: meanAnomaly, // Include mean anomaly in response
          semi_major_axis: semiMajorAxis, // Include semi-major axis in response
        },
      });
    } else {
      res.status(404).json({ message: `Object '${objectName}' not found.` });
    }
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ message: 'Error fetching data from database.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// app.get('/elliptical', async (req, res) => {
//   let client;
//   try {
//     client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
//     const db = client.db(dbName);

//     const neaData = await db.collection(neaCollection).find().toArray();

//     // Check if neaData is an array and has items
//     if (!Array.isArray(neaData) || neaData.length === 0) {
//       return res.status(404).json({ message: 'No data found in neaCollection.' });
//     }

//     // Filter to include only hazardous asteroids
//     const hazardousAsteroids = neaData.filter(nea => nea.is_potentially_hazardous_asteroid);

//     // Map to extract relevant orbital data
//     const orbits = hazardousAsteroids.map(nea => {
//       const semiMajorAxis = parseFloat(nea.orbital_data?.semi_major_axis) || 'N/A';
//       const eccentricity = parseFloat(nea.orbital_data?.eccentricity) || 'N/A';
//       const meanAnomaly = parseFloat(nea.orbital_data?.mean_anomaly) || 'N/A'; // Extract mean anomaly

//       return {
//         name: nea.name,
//         semiMajorAxis,
//         eccentricity,
//         meanAnomaly,
//         is_potentially_hazardous_asteroid: nea.is_potentially_hazardous_asteroid, // Include this in the response
//       };
//     });

//     // Log orbits to verify structure
//     console.log('Orbits:', JSON.stringify(orbits, null, 2));

//     // Return JSON response
//     res.json(orbits);
//   } catch (error) {
//     console.error('Error fetching data from MongoDB:', error);
//     res.status(500).json({ message: 'Error fetching data from database.' });
//   } finally {
//     if (client) {
//       await client.close();
//     }
//   }
// });
// app.get('/elliptical', async (req, res) => {
//   let client;
//   try {
//     client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
//     const db = client.db(dbName);

//     const neaData = await db.collection(neaCollection).find().toArray();

//     // Check if neaData is an array and has items
//     if (!Array.isArray(neaData) || neaData.length === 0) {
//       return res.status(404).json({ message: 'No data found in neaCollection.' });
//     }

//     // Map to extract relevant orbital data without filtering for hazardous asteroids
//     const orbits = neaData.map(nea => {
//       const semiMajorAxis = parseFloat(nea.orbital_data?.semi_major_axis) || 'N/A';
//       const eccentricity = parseFloat(nea.orbital_data?.eccentricity) || 'N/A';
//       const inclination = parseFloat(nea.orbital_data?.inclination) || 'N/A';
//       const ascendingNodeLongitude = parseFloat(nea.orbital_data?.ascending_node_longitude) || 'N/A';
//       const argumentOfPeriapsis = parseFloat(nea.orbital_data?.perihelion_argument) || 'N/A';
//       const meanAnomaly = parseFloat(nea.orbital_data?.mean_anomaly) || 'N/A';

//       return {
//         name: nea.name,
//         semiMajorAxis,
//         eccentricity,
//         inclination,
//         ascendingNodeLongitude,
//         argumentOfPeriapsis,
//         meanAnomaly,
//         is_potentially_hazardous_asteroid: nea.is_potentially_hazardous_asteroid, // Include this in the response
//       };
//     });

//     // Return the orbital data
//     res.json(orbits);
//   } catch (error) {
//     console.error('Error connecting to the database:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   } finally {
//     if (client) {
//       client.close();
//     }
//   }
// });

app.get('/elliptical', async (req, res) => {
  let client;

  try {
    client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);

    const neaData = await db.collection(neaCollection).find().toArray();

    // Check if neaData is an array and has items
    if (!Array.isArray(neaData) || neaData.length === 0) {
      return res.status(404).json({ message: 'No data found in neaCollection.' });
    }

    // Map to extract relevant orbital data
    const orbits = neaData.map(({ name, orbital_data = {}, is_potentially_hazardous_asteroid }) => {
      const { semi_major_axis, eccentricity, orbital_period } = orbital_data;
      
      return {
        name,
        semiMajorAxis: parseFloat(semi_major_axis) || 'N/A',
        eccentricity: parseFloat(eccentricity) || 'N/A',
        orbitalPeriod: parseFloat(orbital_period) || 'N/A', // Including orbital period extraction
        is_potentially_hazardous_asteroid,
      };
    });

    // Return the orbital data
    res.json(orbits);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      client.close();
    }
  }
});


// Elliptical endpoint for comets
app.get('/elliptical2', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);

    // Fetch data for comets
    const necData = await db.collection(necCollection).find().toArray();

    // Check if necData is an array and has items
    if (!Array.isArray(necData) || necData.length === 0) {
      return res.status(404).json({ message: 'No data found in necCollection.' });
    }

    const currentJulianDate = getCurrentJulianDate(); // Get current Julian date

    // Map to extract relevant orbital data for comets
    const cometOrbits = necData.map(nec => {
      const meanAnomaly = calculateMeanAnomaly(nec, currentJulianDate); // Calculate mean anomaly for each comet
      const semiMajorAxis = calculateSemiMajorAxis(nec); // Calculate semi-major axis

      return {
        name: nec.object_name,
        semiMajorAxis, // Include calculated semi-major axis
        eccentricity: nec.e || 'N/A',
        meanAnomaly, // Include calculated mean anomaly
        type: 'Comet',
      };
    });

    // Log orbits to verify structure
    console.log('Comet Orbits:', JSON.stringify(cometOrbits, null, 2));

    // Return JSON response
    res.json(cometOrbits);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ message: 'Error fetching data from database.' });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
