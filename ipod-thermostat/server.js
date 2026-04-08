const axios = require('axios');
const express = require('express');
require('dotenv').config();
const app = express();

app.use(express.static('public'));

// Configuration HA
// const HA_URL = 'https://homeassistant.aymericdo.ovh'; // http://homeassistant.local:8123 soon
// const HA_TOKEN = process.env.HA_TOKEN;

const HA_TOKEN = process.env.SUPERVISOR_TOKEN;
const HA_URL = "http://supervisor/core";
const PORT = 8080

const haApi = axios.create({
  baseURL: `${HA_URL}`,
  headers: {
    'Authorization': `Bearer ${HA_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

app.get('/api/temps', async (req, res) => {
  try {
    const sensors = [
      'sensor.0xb48931fffe3bf627_temperature', // Salon actuel
      'sensor.0xb48931fffe3bf627_temperature', // 'climate.thermostat_salon',              // Salon cible
      'sensor.0xb48931fffe3bf1a9_temperature', // Véranda actuel
      'sensor.0xb48931fffe3bf1a9_temperature', // 'climate.thermostat_veranda'             // Véranda cible
    ];

    // On récupère tout d'un coup
    const requests = sensors.map(id => haApi.get(`/states/${id}`));
    const results = await Promise.all(requests);

    // On structure les données proprement
    const data = {
      salon: {
        actuelle: parseFloat(results[0].data.state),
        cible: results[1].data.attributes.temperature,
      },
      veranda: {
        actuelle: parseFloat(results[2].data.state),
        cible: results[3].data.attributes.temperature,
      }
    };

    res.json(data);
  } catch (error) {
    console.error("Détail de l'erreur HA :");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
    res.status(500).send("Erreur de lecture HA");
  }
});

// SET température
app.get('/api/set', async (req, res) => {
  const room = req.query.room;
  const value = parseFloat(req.query.value);

  // Mapping de tes pièces vers les entités HA
  const entityMapping = {
    salon: 'climate.thermostat_salon',
    veranda: 'climate.thermostat_veranda'
  };

  const entityId = entityMapping[room];

  if (entityId) {
    try {
      // On appelle le service 'set_temperature' du domaine 'climate'
      await haApi.post('/services/climate/set_temperature', {
        entity_id: entityId,
        temperature: value
      });
      res.send(`Température de ${room} mise à jour à ${value}°C`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Erreur lors de la communication avec HA");
    }
  } else {
    res.status(404).send("Pièce non trouvée");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
