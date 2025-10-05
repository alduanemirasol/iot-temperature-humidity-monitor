const DB =
  "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app";
const PATH = "/sensor.json";
const OFFLINE_THRESHOLD = 15000; // 15s

async function fetchData() {
  try {
    const res = await fetch(DB + PATH); // get data
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    const t = data?.temperature ?? data?.temp ?? null; // temp
    const h = data?.humidity ?? data?.hum ?? null; // humidity
    const lastUpdate = data?.timestamp ? new Date(data.timestamp) : new Date(); // timestamp
    const isOffline = new Date() - lastUpdate > OFFLINE_THRESHOLD; // check offline

    if (t !== null && h !== null && !isOffline) {
      tempElem.textContent = `${t} °C`;
      humElem.textContent = `${h} %`;
      lastElem.textContent = `Last update: ${lastUpdate.toLocaleString()}`;
      tempElem.style.color =
        humElem.style.color =
        lastElem.style.color =
          "#eeeeee"; // normal color
    } else {
      tempElem.textContent = humElem.textContent = "Sensor offline";
      lastElem.textContent = isOffline ? "No recent data" : "No data";
      tempElem.style.color =
        humElem.style.color =
        lastElem.style.color =
          "#d62828"; // warning
    }
  } catch (err) {
    console.error(err);
    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    tempElem.textContent = humElem.textContent = "Sensor offline";
    lastElem.textContent = "Error fetching";
    tempElem.style.color =
      humElem.style.color =
      lastElem.style.color =
        "#d62828"; // warning
  }
}

fetchData(); // initial fetch
setInterval(fetchData, 1500); // repeat every 1.5s
