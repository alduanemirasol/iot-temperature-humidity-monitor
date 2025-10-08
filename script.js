const DB =
  "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app";
const PATH = "/sensor.json";

const tempElem = document.getElementById("temp");
const humElem = document.getElementById("hum");
const lastElem = document.getElementById("last");

function updateUI(temp, hum, last, color) {
  tempElem.textContent = temp;
  humElem.textContent = hum;
  lastElem.textContent = last;
  tempElem.style.color = humElem.style.color = lastElem.style.color = color;
}

async function fetchData() {
  if (!navigator.onLine) {
    updateUI("Offline", "Offline", "No connection", "#ff4d4d");
    return;
  }

  try {
    const res = await fetch(DB + PATH + "?t=" + Date.now());
    if (!res.ok) throw new Error("Network error");

    const data = await res.json();
    if (!data || typeof data !== "object") throw new Error("Invalid data");

    const t = data.temperature ?? data.temp;
    const h = data.humidity ?? data.hum;
    const timestamp = data.timestamp ?? null;

    if (t == null || h == null || !timestamp) {
      updateUI("No data", "No data", "No data available", "#ffb703");
      return;
    }

    const dt = new Date(timestamp.replace(" ", "T") + "+08:00");
    if (isNaN(dt)) {
      updateUI("No data", "No data", "Invalid timestamp", "#ffb703");
      return;
    }

    const phtTime = dt.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour12: true,
    });

    updateUI(`${t}°C`, `${h}%`, `Last update: ${phtTime}`, "#eeeeee");
  } catch (err) {
    updateUI("No data", "No data", "Fetch failed", "#d62828");
  }
}

fetchData();
setInterval(fetchData, 2000);
