const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const mqtt = require('mqtt');
const app = express();
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./weather.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS weather_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Connect to MQTT Broker
const mqttClient = mqtt.connect('ws://157.173.101.159:9001');

mqttClient.on('connect', () => {
    console.log("Connected to MQTT via WebSockets");
    mqttClient.subscribe("/work_group_01/room_temp/temperature");
    mqttClient.subscribe("/work_group_01/room_temp/humidity");
});

mqttClient.on('message', (topic, message) => {
    const value = parseFloat(message.toString());
    if (topic === "/work_group_01/room_temp/temperature") {
        db.run(`INSERT INTO weather_data (temperature) VALUES (?)`, [value]);
    } else if (topic === "/work_group_01/room_temp/humidity") {
        db.run(`INSERT INTO weather_data (humidity) VALUES (?)`, [value]);
    }
});

app.get('/averaged-data', (req, res) => {
    const query = `
        SELECT 
            strftime('%Y-%m-%d %H:%M', timestamp) as time,
            AVG(temperature) as avg_temp,
            AVG(humidity) as avg_humidity
        FROM weather_data
        GROUP BY strftime('%Y-%m-%d %H:%M', timestamp)
        ORDER BY time DESC
        LIMIT 12
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const labels = rows.map(row => row.time).reverse();
        const temperature = rows.map(row => row.avg_temp).reverse();
        const humidity = rows.map(row => row.avg_humidity).reverse();

        res.json({ labels, temperature, humidity });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});