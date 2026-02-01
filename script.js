const firebaseConfig = {
  databaseURL:
    "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const sensorRef = db.ref("/sensor");

// DOM Elements
const tempElem = document.getElementById("temp");
const humElem = document.getElementById("hum");
const lastUpdateElem = document.getElementById("lastUpdate");
const syncTimeElem = document.getElementById("syncTime");
const statusElem = document.getElementById("status");
const statusDot = statusElem?.querySelector(".status-dot");
const statusText = statusElem?.querySelector(".status-text");

// Trend elements
const tempTrend = document.getElementById("tempTrend");
const humTrend = document.getElementById("humTrend");

// Gauge elements
const tempGauge = document.getElementById("tempGauge");
const humWave = document.getElementById("humWave");

// Stat elements
const feelsLikeElem = document.getElementById("feelsLike");
const tempStatusElem = document.getElementById("tempStatus");
const comfortLevelElem = document.getElementById("comfortLevel");
const humStatusElem = document.getElementById("humStatus");
const heatIndexElem = document.getElementById("heatIndex");
const overallComfortElem = document.getElementById("overallComfort");

// Previous values for trend calculation
let prevTemp = null;
let prevHum = null;
let connectionCheckInterval = null;
let lastDataTimestamp = null;

// Connection timeout threshold (in milliseconds)
const CONNECTION_TIMEOUT = 60000; // 60 seconds - adjust based on your IoT update frequency

// Update connection status
function updateStatus(state, message) {
  if (statusDot) {
    statusDot.className = `status-dot ${state}`;
  }
  if (statusText) {
    statusText.textContent = message;
  }
}

// Check if device is still connected based on timestamp
function checkDeviceConnection() {
  if (!lastDataTimestamp) {
    updateStatus("error", "No Data");
    return;
  }

  const now = Date.now();
  const timeSinceLastUpdate = now - lastDataTimestamp;

  if (timeSinceLastUpdate > CONNECTION_TIMEOUT) {
    updateStatus("error", "Device Offline");
    // Optionally dim the values to show they're stale
    if (tempElem) tempElem.style.opacity = "0.5";
    if (humElem) humElem.style.opacity = "0.5";
  } else if (timeSinceLastUpdate > CONNECTION_TIMEOUT / 2) {
    updateStatus("connecting", "Connection Weak");
  } else {
    updateStatus("", "Connected");
    if (tempElem) tempElem.style.opacity = "1";
    if (humElem) humElem.style.opacity = "1";
  }
}

// Start monitoring connection
function startConnectionMonitoring() {
  // Check connection status every 10 seconds
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  connectionCheckInterval = setInterval(checkDeviceConnection, 10000);
}

// Update sync time
function updateSyncTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  if (syncTimeElem) {
    syncTimeElem.textContent = timeString;
  }
}

// Calculate Heat Index (feels like temperature)
function calculateHeatIndex(temp, humidity) {
  if (temp < 27) return temp.toFixed(1);

  const T = temp;
  const RH = humidity;

  let HI =
    -8.78469475556 +
    1.61139411 * T +
    2.33854883889 * RH +
    -0.14611605 * T * RH +
    -0.012308094 * T * T +
    -0.0164248277778 * RH * RH +
    0.002211732 * T * T * RH +
    0.00072546 * T * RH * RH +
    -0.000003582 * T * T * RH * RH;

  return HI.toFixed(1);
}

// Get temperature status
function getTempStatus(temp) {
  if (temp < 15) return "Cold ❄️";
  if (temp < 20) return "Cool 🌤️";
  if (temp < 26) return "Comfortable 😊";
  if (temp < 30) return "Warm ☀️";
  if (temp < 35) return "Hot 🔥";
  return "Very Hot 🌡️";
}

// Get humidity status
function getHumStatus(humidity) {
  if (humidity < 30) return "Dry 🏜️";
  if (humidity < 40) return "Low 📉";
  if (humidity < 60) return "Comfortable 😊";
  if (humidity < 70) return "Moderate 💧";
  if (humidity < 80) return "High 📈";
  return "Very High 💦";
}

// Get overall comfort level
function getOverallComfort(temp, humidity) {
  if (temp < 18 || temp > 30) return "Poor 😰";
  if (humidity < 30 || humidity > 70) return "Fair 😐";
  if (temp >= 20 && temp <= 26 && humidity >= 40 && humidity <= 60)
    return "Excellent 😊";
  return "Good 🙂";
}

// Update trend indicator
function updateTrend(element, current, previous) {
  if (!element || previous === null) {
    if (element) {
      element.className = "trend-badge";
      element.innerHTML = "";
    }
    return;
  }

  const diff = current - previous;

  if (Math.abs(diff) < 0.2) {
    element.className = "trend-badge stable";
    element.innerHTML = '<i class="fa-solid fa-minus"></i> Stable';
  } else if (diff > 0) {
    element.className = "trend-badge up";
    element.innerHTML = '<i class="fa-solid fa-arrow-up"></i> Rising';
  } else {
    element.className = "trend-badge down";
    element.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Falling';
  }
}

// Update temperature gauge
function updateTempGauge(temp) {
  if (!tempGauge) return;

  // Temperature range: 0-50°C
  const percentage = Math.min(Math.max((temp / 50) * 100, 0), 100);

  if (tempGauge.querySelector("::after")) {
    tempGauge.style.setProperty("--gauge-width", `${percentage}%`);
  }

  // Create a visual indicator at the current temperature
  const existingMarker = tempGauge.querySelector(".temp-marker");
  if (existingMarker) {
    existingMarker.remove();
  }

  const marker = document.createElement("div");
  marker.className = "temp-marker";
  marker.style.cssText = `
    position: absolute;
    top: -8px;
    left: ${percentage}%;
    width: 4px;
    height: 28px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateX(-50%);
    transition: left 0.8s ease;
  `;
  tempGauge.appendChild(marker);
}

// Update humidity wave
function updateHumWave(humidity) {
  if (!humWave) return;

  // Humidity range: 0-100%
  const percentage = Math.min(Math.max(humidity, 0), 100);
  humWave.style.height = `${percentage}%`;
}

// Process sensor data
function processSensorData(data) {
  if (!data) {
    tempElem.textContent = "--";
    humElem.textContent = "--";
    lastUpdateElem.textContent = "No data available";
    updateStatus("error", "No Data");
    lastDataTimestamp = null;
    return;
  }

  const t = data.temperature ?? data.temp ?? null;
  const h = data.humidity ?? data.hum ?? null;
  const timestamp = data.timestamp ?? null;

  if (t === null || h === null) {
    tempElem.textContent = "--";
    humElem.textContent = "--";
    lastUpdateElem.textContent = "Invalid data";
    updateStatus("error", "Invalid Data");
    lastDataTimestamp = null;
    return;
  }

  const tempValue = parseFloat(t);
  const humValue = parseFloat(h);

  // Update main displays
  tempElem.textContent = tempValue.toFixed(1);
  humElem.textContent = humValue.toFixed(0);

  // Format timestamp and update lastDataTimestamp
  let formattedTime = "—";
  if (timestamp) {
    try {
      const dt = new Date(timestamp.replace(" ", "T") + "+08:00");
      lastDataTimestamp = dt.getTime();

      formattedTime = dt.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: true,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Check if data is stale
      const now = Date.now();
      const timeSinceUpdate = now - lastDataTimestamp;

      if (timeSinceUpdate > CONNECTION_TIMEOUT) {
        updateStatus("error", "Device Offline");
        lastUpdateElem.textContent = `Last seen: ${formattedTime} (Offline)`;
        tempElem.style.opacity = "0.5";
        humElem.style.opacity = "0.5";
        return; // Don't update other values if data is stale
      }
    } catch {
      formattedTime = "—";
      lastDataTimestamp = Date.now(); // Use current time as fallback
    }
  } else {
    // No timestamp means fresh data just arrived
    lastDataTimestamp = Date.now();
  }

  lastUpdateElem.textContent = `Last updated: ${formattedTime}`;
  updateStatus("", "Connected");
  updateSyncTime();

  // Ensure values are fully visible
  tempElem.style.opacity = "1";
  humElem.style.opacity = "1";

  // Update trends
  updateTrend(tempTrend, tempValue, prevTemp);
  updateTrend(humTrend, humValue, prevHum);

  // Update gauges
  updateTempGauge(tempValue);
  updateHumWave(humValue);

  // Calculate and display stats
  const heatIndex = calculateHeatIndex(tempValue, humValue);

  if (feelsLikeElem) feelsLikeElem.textContent = `${heatIndex}°C`;
  if (tempStatusElem) tempStatusElem.textContent = getTempStatus(tempValue);
  if (comfortLevelElem) comfortLevelElem.textContent = getHumStatus(humValue);
  if (humStatusElem) humStatusElem.textContent = getHumStatus(humValue);
  if (heatIndexElem) heatIndexElem.textContent = `${heatIndex}°C`;
  if (overallComfortElem)
    overallComfortElem.textContent = getOverallComfort(tempValue, humValue);

  // Store current values for next comparison
  prevTemp = tempValue;
  prevHum = humValue;

  // Add update animation
  tempElem.classList.remove("reading-value");
  humElem.classList.remove("reading-value");
  void tempElem.offsetWidth; // Trigger reflow
  tempElem.classList.add("reading-value");
  humElem.classList.add("reading-value");
}

// Initialize Firebase listener
updateStatus("connecting", "Connecting...");

sensorRef.on(
  "value",
  (snapshot) => {
    processSensorData(snapshot.val());
  },
  (error) => {
    console.error("Firebase error:", error);
    tempElem.textContent = "--";
    humElem.textContent = "--";
    lastUpdateElem.textContent = "Connection error";
    updateStatus("error", "Connection Error");
    lastDataTimestamp = null;
  },
);

// Start monitoring device connection
startConnectionMonitoring();

// Update sync time every second
setInterval(updateSyncTime, 1000);
updateSyncTime();

// Add loading state to elements initially
tempElem.classList.add("loading");
humElem.classList.add("loading");

// Remove loading state after first data
sensorRef.once("value", () => {
  tempElem.classList.remove("loading");
  humElem.classList.remove("loading");
});
