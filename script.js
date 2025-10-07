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
    const res = await fetch(DB + PATH);
    const data = await res.json();

    const t = data?.temperature ?? data?.temp;
    const h = data?.humidity ?? data?.hum;
    const ts = data?.timestamp;
    if (!ts) throw new Error("No timestamp");

    const dt = new Date(ts.replace(" ", "T") + "+08:00");
    const now = new Date();
    const diffSeconds = (now - dt) / 1000;

    const phtTime = dt.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour12: true,
    });

    if (diffSeconds > 10) {
      updateUI(
        `${t ?? "?"}°C`,
        `${h ?? "?"}%`,
        `Last update: ${phtTime} (Sensor Offline)`,
        "#d62828"
      );
    } else {
      updateUI(`${t}°C`, `${h}%`, `Last update: ${phtTime}`, "#eeeeee");
    }
  } catch {
    updateUI("No data", "No data", "No connection", "#d62828");
  }
}

fetchData();
setInterval(fetchData, 2000);
