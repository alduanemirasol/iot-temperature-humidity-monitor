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
  try {
    const res = await fetch(DB + PATH + "?t=" + Date.now());
    if (!res.ok) throw new Error("Network error");

    const data = await res.json();
    const t = data.temperature ?? data.temp;
    const h = data.humidity ?? data.hum;
    const timestamp = data.timestamp ?? null;

    const dt = new Date(timestamp.replace(" ", "T") + "+08:00");
    const phtTime = dt.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour12: true,
    });

    updateUI(`${t}°C`, `${h}%`, `Last update: ${phtTime}`, "#eeeeee");
  } catch {
    updateUI("Error", "Error", "Fetch failed", "#d62828");
  }
}

fetchData();
setInterval(fetchData, 2000);
