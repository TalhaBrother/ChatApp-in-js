// Dummy data if none exists
if (!localStorage.getItem("chatHistory")) {
  const dummy = [
    { user: "Alice", text: "Hi", timestamp: Date.now() - 86400000 * 2 },
    { user: "Bob", text: "Hello", timestamp: Date.now() - 86400000 },
    { user: "Alice", text: "How are you?", timestamp: Date.now() },
    { user: "Charlie", text: "Good!", timestamp: Date.now() }
  ];
  localStorage.setItem("chatHistory", JSON.stringify(dummy));
}

const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

// Messages per user
const userStats = {};
history.forEach(m => {
  userStats[m.user] = (userStats[m.user] || 0) + 1;
});

// Messages per day
const dailyStats = {};
history.forEach(m => {
  const date = new Date(m.timestamp).toLocaleDateString();
  dailyStats[date] = (dailyStats[date] || 0) + 1;
});

// Most active user
let maxUser = "No Data";
let maxCount = 0;
if (Object.keys(userStats).length > 0) {
  maxUser = Object.keys(userStats).reduce((a, b) => userStats[a] > userStats[b] ? a : b);
  maxCount = userStats[maxUser];
}
document.getElementById("mostActive").innerHTML = `
  <div class="highlight-box">
    🏆 Most Active: <strong>${maxUser}</strong>  
    <br>💬 Messages: ${maxCount}
  </div>
`;

// User Chart
new Chart(document.getElementById("userChart"), {
  type: 'bar',
  data: {
    labels: Object.keys(userStats),
    datasets: [{
      data: Object.values(userStats),
      backgroundColor: ['#6a11cb', '#2575fc', '#00c9a7', '#ffb347'],
      borderRadius: 10
    }]
  },
  options: { responsive: true, plugins: { legend: { display: false } } }
});

// Daily Chart
new Chart(document.getElementById("dailyChart"), {
  type: 'line',
  data: {
    labels: Object.keys(dailyStats),
    datasets: [{
      label: 'Messages per Day',
      data: Object.values(dailyStats),
      borderColor: '#2575fc',
      backgroundColor: 'rgba(37,117,252,0.2)',
      tension: 0.4,
      fill: true
    }]
  },
  options: { responsive: true }
});
