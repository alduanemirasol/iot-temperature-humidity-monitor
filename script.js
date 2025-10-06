const DB =
  "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app";
const PATH = "/sensor.json";

async function fetchData() {
  try {
    const res = await fetch(DB + PATH);
    const data = await res.json();

    const tempElem = document.getElementById("temp");
    const humElem = document.getElementById("hum");
    const lastElem = document.getElementById("last");

    const t = data?.temperature ?? data?.temp;
    const h = data?.humidity ?? data?.hum;

    let dt = new Date(data?.timestamp?.replace(" ", "T") + "+08:00");

    const phtTime = dt.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour12: true,
    });

    if (t !== undefined && h !== undefined && !isNaN(dt)) {
      tempElem.textContent = `${t}°C`;
      humElem.textContent = `${h}%`;
      lastElem.textContent = `Last update: ${phtTime}`;
      tempElem.style.color =
        humElem.style.color =
        lastElem.style.color =
          "#eeeeee";
    } else {
      tempElem.textContent =
        humElem.textContent =
        lastElem.textContent =
          "No data";
      tempElem.style.color =
        humElem.style.color =
        lastElem.style.color =
          "#d62828";
    }
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
