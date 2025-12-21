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
  console.log("Updating UI:", { temp, hum, last, color });
  tempElem.textContent = temp;
  humElem.textContent = hum;
  lastElem.textContent = last;
  tempElem.style.color = humElem.style.color = lastElem.style.color = color;
}

sensorRef.on("value", (snapshot) => {
  console.log("Firebase snapshot received:", snapshot);
  const data = snapshot.val();
  console.log("Firebase data value:", data);

  if (!data) {
    console.warn("No data received from Firebase");
    updateUI("--", "--", "No data", "#d62828");
    return;
  }

  const t = data.temperature ?? data.temp ?? "--";
  const h = data.humidity ?? data.hum ?? "--";
  const timestamp = data.timestamp ?? null;

  let phtTime = "—";
  if (timestamp) {
    try {
      const dt = new Date(timestamp.replace(" ", "T") + "+08:00");
      phtTime = dt.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: true,
      });
    } catch (e) {
      console.error("Timestamp parse error:", e, timestamp);
    }
  } else {
    console.warn("No timestamp provided in data");
  }

  updateUI(`${t}°C`, `${h}%`, `Last update: ${phtTime}`, "#eeeeee");
}, (error) => {
  console.error("Firebase error:", error);
  updateUI("Error", "Error", "Fetch failed", "#d62828");
});
