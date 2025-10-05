const DB =
  "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app";
const PATH = "/sensor.json";

let startMillis = Date.now();

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

    const timestamp = data?.timestamp ?? 0;
    const lastUpdate = new Date(startMillis + timestamp);

    if (t !== null && h !== null) {
      tempElem.textContent = `${t} °C`;
      humElem.textContent = `${h} %`;
      lastElem.textContent = `Last update: ${lastUpdate.toLocaleString()}`;
      tempElem.style.color =
        humElem.style.color =
        lastElem.style.color =
          "#eeeeee";
    } else {
      tempElem.textContent = humElem.textContent = "No data";
      lastElem.textContent = "No data";
      tempElem.style.color =
        humElem.style.color =
        lastElem.style.color =
          "#d62828";
    }
  } catch (err) {
    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    tempElem.textContent = humElem.textContent = "Sensor offline";
    lastElem.textContent = "Error fetching";
    tempElem.style.color =
      humElem.style.color =
      lastElem.style.color =
        "#d62828";
  }
}

fetchData();
setInterval(fetchData, 2000);
