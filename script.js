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
    let dt = new Date(data?.timestamp?.replace(" ", "T") + "+08:00");

    if (t !== undefined && h !== undefined && !isNaN(dt)) {
      const phtTime = dt.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: true,
      });
      updateUI(`${t}°C`, `${h}%`, `Last update: ${phtTime}`, "#eeeeee");
    } else {
      updateUI("No data", "No data", "No data", "#d62828");
    }
  } catch {
    updateUI("No data", "No data", "No data", "#d62828");
  }
}

fetchData();
setInterval(fetchData, 2000);
