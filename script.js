const firebaseConfig = {
  databaseURL: "https://iot-temp-humidity-monito-fbbb4-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const sensorRef = db.ref("/sensor");

const tempElem = document.getElementById("temp");
const humElem = document.getElementById("hum");
const lastElem = document.getElementById("last");

function updateUI(temp, hum, last, color) {
  tempElem.textContent = temp;
  humElem.textContent = hum;
  lastElem.textContent = last;
  tempElem.style.color = humElem.style.color = lastElem.style.color = color;
}

function processSensorData(data) {
  if (!data) {
    updateUI("--", "--", "No data", "#d62828");
    return;
  }

  const t = data.temperature ?? data.temp ?? "--";
  const h = data.humidity ?? data.hum ?? "--";
  const timestamp = data.timestamp ?? null;

  let formattedTime = "—";
  if (timestamp) {
    try {
      const dt = new Date(timestamp.replace(" ", "T") + "+08:00");
      formattedTime = dt.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: true,
      });
    } catch {}
  }

  updateUI(`${t}°C`, `${h}%`, `Last update: ${formattedTime}`, "#eeeeee");
}

sensorRef.on(
  "value",
  snapshot => processSensorData(snapshot.val()),
  () => updateUI("Error", "Error", "Fetch failed", "#d62828")
);
