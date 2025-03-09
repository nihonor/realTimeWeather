# MQTT Weather Station

## Overview
The MQTT Weather Station is a web application that displays real-time temperature and humidity data using MQTT over WebSockets. The application consists of a front-end built with HTML, CSS, and JavaScript, and a back-end powered by Node.js, Express, and SQLite for data storage.

## Features
- Real-time display of temperature and humidity data.
- Data is stored in a SQLite database for historical analysis.
- API endpoint to retrieve 5-minute averages of temperature and humidity.
- Responsive design for various screen sizes.

## Technologies Used
- **Front-end**: HTML5, CSS3, JavaScript
- **Back-end**: Node.js, Express
- **Database**: SQLite
- **MQTT**: MQTT.js for MQTT communication

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/mqtt-weather-station.git
   cd mqtt-weather-station
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```
lastly
```bash
npm start
```
4. **Open the `index.html` file in your web browser:**
   You can simply double-click the `index.html` file or access it through a local server.

## Usage
- The application connects to an MQTT broker to receive temperature and humidity data.
- The data is displayed in real-time on the web page.
- Ensure that the MQTT broker is running and accessible at the specified WebSocket URL (`ws://157.173.101.159:9001`).

### API Endpoint
- **Get 5-minute averages**: 
  - Endpoint: `/averages`
  - This endpoint returns the average temperature and humidity for the last hour, grouped in 5-minute intervals.

## Customization
- You can modify the styles in the `<style>` section of the `index.html` file to change the appearance of the application.
- Update the MQTT broker URL in the JavaScript section if you are using a different broker.

