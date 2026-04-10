const axios = require('axios');
const express = require('express');
require('dotenv').config({ quiet: true });
const app = express();
const fs = require('fs');

const PORT = 8080

app.use(express.static('public'));

let HA_URL = process.env.HA_URL;
let HA_TOKEN = process.env.HA_TOKEN;

if (!HA_TOKEN) {
  try {
    const options = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));
    HA_TOKEN = options.ha_token;
    HA_URL = options.ha_url;
  } catch (err) {
    console.error("Impossible de lire le fichier options.json", err);
  }
}

const haApi = axios.create({
  baseURL: `${HA_URL}/api`,
  headers: {
    'Authorization': `Bearer ${HA_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

app.get('/api/temps', async (req, res) => {
  try {
    const sensors = [
      'sensor.0xb48931fffe3bf627_temperature', // Salon actuel
      'input_select.chauffage_salon',
      'sensor.0xb48931fffe3bf1a9_temperature', // Véranda actuel
      'input_select.chauffage_veranda'
    ];

    // On récupère tout d'un coup
    const requests = sensors.map(id => haApi.get(`/states/${id}`));
    const results = await Promise.all(requests);

    // On structure les données proprement
    const data = {
      salon: {
        current: parseFloat(results[0].data.state),
        currentMode: results[1].data.state,
      },
      veranda: {
        current: parseFloat(results[2].data.state),
        currentMode: results[3].data.state,
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
app.get('/api/set_temp', async (req, res) => {
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

// SET mode
app.get('/api/set_mode', async (req, res) => {
  const room = req.query.room;
  const value = req.query.value;

  // Mapping de tes pièces vers les entités HA
  const entityMapping = {
    salon: 'input_select.chauffage_salon',
    veranda: 'input_select.chauffage_veranda'
  };

  const entityId = entityMapping[room];

  if (entityId) {
    try {
      // On appelle le service 'set_temperature' du domaine 'climate'
      await haApi.post('/services/input_select/select_option', {
        entity_id: entityId,
        option: value
      });
      res.send(`Mode de ${room} mis à jour à ${value}`);
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
