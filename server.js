const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MQTT setup
const mqttClient = mqtt.connect('ws://157.173.101.159:9001');
const topics = {
  temperature: '/work_group_01/room_temp/temperature',
  humidity: '/work_group_01/room_temp/humidity'
};

// SQLite setup
const db = new sqlite3.Database('weather.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite');
});

db.run(`
  CREATE TABLE IF NOT EXISTS weather (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER,
    temperature REAL,
    humidity REAL
  )
`);

// Store MQTT data
mqttClient.on('connect', () => {
  console.log('Connected to MQTT');
  mqttClient.subscribe(Object.values(topics));
});

mqttClient.on('message', (topic, message) => {
  const value = parseFloat(message.toString());
  const timestamp = Math.floor(Date.now() / 1000);

  if (topic === topics.temperature) {
    db.run('INSERT INTO weather (timestamp, temperature) VALUES (?, ?)', [timestamp, value]);
    console.log(`Stored temperature: ${value}°C`);
  } else if (topic === topics.humidity) {
    db.run('INSERT INTO weather (timestamp, humidity) VALUES (?, ?)', [timestamp, value]);
    console.log(`Stored humidity: ${value}%`);
  }
});

// API for 5-minute averages
app.get('/averages', (req, res) => {
  const fiveMinInSeconds = 5 * 60;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - (60 * 60); // Last hour

  db.all(`
    SELECT 
      FLOOR(timestamp / ${fiveMinInSeconds}) * ${fiveMinInSeconds} AS time_bucket,
      AVG(temperature) AS avg_temp,
      AVG(humidity) AS avg_humidity
    FROM weather
    WHERE timestamp >= ${startTime}
    GROUP BY FLOOR(timestamp / ${fiveMinInSeconds})
    ORDER BY time_bucket ASC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows.map(row => ({
        time: new Date(row.time_bucket * 1000).toLocaleTimeString(),
        temperature: row.avg_temp ? row.avg_temp.toFixed(2) : null,
        humidity: row.avg_humidity ? row.avg_humidity.toFixed(2) : null
      })));
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});