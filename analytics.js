import { db, auth, collection, getDocs, onAuthStateChanged } from "./config.js";

const chatDocId = "ehtSBEXsTrUPEC97Oeu3tLDpuV12_xkXxxNWVyydRUbw3nx8D7BPMNwD2";

async function loadAnalytics() {
  try {
    console.log("Loading analytics...");

    // Reference to messages subcollection
    const messagesRef = collection(db, "chats", chatDocId, "messages");
    const messagesSnap = await getDocs(messagesRef);

    if (messagesSnap.empty) {
      console.warn("No messages found in this chat!");
      return;
    }

    const history = [];

    messagesSnap.forEach(msgDoc => {
      const m = msgDoc.data();
      if (m.timestamp) {
        if (typeof m.timestamp.toMillis === "function") {
          history.push(m);
        } else {
          m.timestamp = new Date(m.timestamp);
          history.push(m);
        }
      } else {
        console.warn("Skipped message (no timestamp):", msgDoc.id, m);
      }
    });

    console.log("Total messages fetched:", history.length);

    // Sort messages by timestamp
    history.sort((a, b) => {
      const timeA = typeof a.timestamp.toMillis === "function" ? a.timestamp.toMillis() : a.timestamp.getTime();
      const timeB = typeof b.timestamp.toMillis === "function" ? b.timestamp.toMillis() : b.timestamp.getTime();
      return timeA - timeB;
    });

    // ======================
    // USER & DAILY STATS
    // ======================
    const userStats = {};
    const dailyStats = {};

    history.forEach(m => {
      const name = m.fromName || "Unknown";
      userStats[name] = (userStats[name] || 0) + 1;

      const day = new Date(typeof m.timestamp.toMillis === "function" ? m.timestamp.toMillis() : m.timestamp.getTime()).toLocaleDateString();
      dailyStats[day] = (dailyStats[day] || 0) + 1;
    });

    // Most active user
    let topUser = "None";
    let max = 0;
    for (let u in userStats) {
      if (userStats[u] > max) {
        max = userStats[u];
        topUser = u;
      }
    }

    document.getElementById("mostActive").innerHTML = `
      🏆 <b>Most Active User:</b> ${topUser}<br>
      💬 Messages: ${max}
    `;

    // ======================
    // CHARTS
    // ======================
    const userCanvas = document.getElementById("userChart").getContext("2d");
    const dailyCanvas = document.getElementById("dailyChart").getContext("2d");

    new Chart(userCanvas, {
      type: "bar",
      data: {
        labels: Object.keys(userStats),
        datasets: [{
          label: "Messages per User",
          data: Object.values(userStats),
          backgroundColor: "#6a11cb"
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    new Chart(dailyCanvas, {
      type: "line",
      data: {
        labels: Object.keys(dailyStats),
        datasets: [{
          label: "Messages per Day",
          data: Object.values(dailyStats),
          borderColor: "#2575fc",
          borderWidth: 2,
          fill: false
        }]
      },
      options: { responsive: true }
    });

  } catch (error) {
    console.error("Error loading analytics:", error);
  }
}

// ✅ Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("User not logged in. Redirecting to login page.");
    window.location.replace("login.html");
  } else {
    console.log("User logged in:", user.uid);
    loadAnalytics();
  }
});
