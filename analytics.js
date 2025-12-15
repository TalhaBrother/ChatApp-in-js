import { db, collection, getDocs } from "./config.js";

async function loadAnalytics() {
  const snap = await getDocs(collection(db, "messages"));
  const history = [];
  snap.forEach(doc => {
    const data = doc.data();
    if (data.timestamp && data.timestamp.toMillis) {
      history.push(data);
    }
  });

  // User stats
  const userStats = {};
  // Daily stats
  const dailyStats = {};

  history.forEach(m => {
    const name = m.fromName || "Unknown";
    userStats[name] = (userStats[name] || 0) + 1;

    const day = new Date(m.timestamp).toLocaleDateString();
    dailyStats[day] = (dailyStats[day] || 0) + 1;
  });

  // Most active user
  let topUser = "None", max = 0;
  Object.keys(userStats).forEach(u => {
    if (userStats[u] > max) { topUser = u; max = userStats[u]; }
  });

  document.getElementById("mostActive").innerHTML = `
    🏆 <b>Most Active User:</b> ${topUser}<br>
    💬 Messages: ${max}
  `;

  // Clear previous canvas if exists
  const userCanvas = document.getElementById("userChart");
  const dailyCanvas = document.getElementById("dailyChart");

  userCanvas.getContext('2d').clearRect(0, 0, userCanvas.width, userCanvas.height);
  dailyCanvas.getContext('2d').clearRect(0, 0, dailyCanvas.width, dailyCanvas.height);

  // User chart
  new Chart(userCanvas, {
    type: 'bar',
    data: {
      labels: Object.keys(userStats),
      datasets: [{
        label: 'Messages per User',
        data: Object.values(userStats),
        backgroundColor: '#6a11cb'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  // Daily chart
  new Chart(dailyCanvas, {
    type: 'line',
    data: {
      labels: Object.keys(dailyStats),
      datasets: [{
        label: 'Messages per Day',
        data: Object.values(dailyStats),
        borderColor: '#2575fc',
        borderWidth: 2,
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

window.addEventListener("load", loadAnalytics);
