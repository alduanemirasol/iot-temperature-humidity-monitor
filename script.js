const DB =
  "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app";
const PATH = "/sensor.json";
const OFFLINE_THRESHOLD = 15000; // 15 seconds

async function fetchData() {
  try {
    const res = await fetch(DB + PATH);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    const t = data?.temperature ?? data?.temp ?? null;
    const h = data?.humidity ?? data?.hum ?? null;
    const lastUpdate = data?.timestamp ? new Date(data.timestamp) : new Date();

    const now = new Date();
    const isOffline = now - lastUpdate > OFFLINE_THRESHOLD;

    if (t !== null && h !== null && !isOffline) {
      tempElem.textContent = t + " °C";
      humElem.textContent = h + " %";
      lastElem.textContent = "Last update: " + lastUpdate.toLocaleString();

      // Reset color to normal
      tempElem.style.color = "#eeeeee";
      humElem.style.color = "#eeeeee";
      lastElem.style.color = "#eeeeeecc";
    } else {
      tempElem.textContent = "Sensor offline";
      humElem.textContent = "Sensor offline";
      lastElem.textContent = isOffline
        ? "No recent data from sensor"
        : "No data available";

      // Subtle warning color
      tempElem.style.color = "#d62828";
      humElem.style.color = "#d62828";
      lastElem.style.color = "#d62828";
    }
  } catch (err) {
    console.error(err);
    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    tempElem.textContent = "Sensor offline";
    humElem.textContent = "Sensor offline";
    lastElem.textContent = "Error fetching data";

    tempElem.style.color = "#d62828";
    humElem.style.color = "#d62828";
    lastElem.style.color = "#d62828";
  }
}

fetchData();
setInterval(fetchData, 5000);
