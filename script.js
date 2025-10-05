const DB =
  "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app";
const PATH = "/sensor.json";

let startMillis = Date.now();

async function fetchData() {
  try {
    const res = await fetch(DB + PATH);
    const data = await res.json();

    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    const t = data?.temperature ?? data?.temp;
    const h = data?.humidity ?? data?.hum;
    const lastUpdate = new Date(startMillis + (data?.timestamp ?? 0));

    tempElem.textContent = t !== undefined ? `${t} °C` : "No data";
    humElem.textContent = h !== undefined ? `${h} %` : "No data";
    lastElem.textContent =
      t !== undefined && h !== undefined
        ? `Last update: ${lastUpdate.toLocaleString()}`
        : "No data";

    tempElem.style.color =
      humElem.style.color =
      lastElem.style.color =
        "#eeeeee";
  } catch {
    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    tempElem.textContent =
      humElem.textContent =
      lastElem.textContent =
        "No data";
    tempElem.style.color =
      humElem.style.color =
      lastElem.style.color =
        "#d62828";
  }
}

fetchData();
setInterval(fetchData, 2000);
