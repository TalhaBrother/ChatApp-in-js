<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chat Analytics</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      text-align: center;
      color: #444;
    }
    #mostActive {
      margin: 20px auto;
      max-width: 400px;
    }
    .chart-container {
      margin: 30px auto;
      max-width: 700px;
      background: #fff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    canvas {
      max-width: 100%;
    }
  </style>
</head>
<body>

  <h1>📊 Chat Analytics</h1>

  <div id="mostActive"></div>

  <div class="chart-container">
    <h2 style="text-align:center">Messages per User</h2>
    <canvas id="userChart"></canvas>
  </div>

  <div class="chart-container">
    <h2 style="text-align:center">Messages per Day</h2>
    <canvas id="dailyChart"></canvas>
  </div>

  <script>
    // Dummy Data Example (agar localStorage empty ho)
    if (!localStorage.getItem("chatHistory")) {
      const dummy = [
        { user: "Alice", text: "Hello", timestamp: Date.now() - 86400000*2 },
        { user: "Bob", text: "Hi", timestamp: Date.now() - 86400000 },
        { user: "Alice", text: "How are you?", timestamp: Date.now() },
        { user: "Charlie", text: "Good!", timestamp: Date.now() }
      ];
      localStorage.setItem("chatHistory", JSON.stringify(dummy));
    }

    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];

    // -------- Messages per User --------
    let userStats = {};
    history.forEach(m => {
      userStats[m.user] = (userStats[m.user] || 0) + 1;
    });

    // -------- Messages per Day --------
    let dailyStats = {};
    history.forEach(m => {
      let date = new Date(m.timestamp).toLocaleDateString();
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // -------- Most Active User --------
    let maxUser = "No Data";
    let maxCount = 0;

    if (Object.keys(userStats).length > 0) {
      maxUser = Object.keys(userStats).reduce((a, b) =>
        userStats[a] > userStats[b] ? a : b
      );
      maxCount = userStats[maxUser];
    }

    document.getElementById("mostActive").innerHTML = `
      <div style="padding: 15px; background: #f0f8ff; border-radius: 10px; 
                  text-align: center; font-size: 18px; font-weight: bold;
                  color: #333; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        🏆 Most Active User: <span style="color:#007bff">${maxUser}</span>  
        <br>💬 Messages: <span style="color:#28a745">${maxCount}</span>
      </div>
    `;

    // -------- User Chart --------
    const userCtx = document.getElementById("userChart").getContext("2d");
    new Chart(userCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(userStats),
        datasets: [{
          label: 'Messages Sent',
          data: Object.values(userStats),
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(54, 162, 235, 0.7)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#222",
            titleColor: "#fff",
            bodyColor: "#eee"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(200,200,200,0.2)" }
          }
        }
      }
    });

    // -------- Daily Chart --------
    const dailyCtx = document.getElementById("dailyChart").getContext("2d");
    new Chart(dailyCtx, {
      type: 'line',
      data: {
        labels: Object.keys(dailyStats),
        datasets: [{
          label: 'Messages per Day',
          data: Object.values(dailyStats),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgba(255, 99, 132, 1)',
          pointRadius: 6,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            backgroundColor: "#333",
            titleColor: "#fff",
            bodyColor: "#eee"
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(200,200,200,0.2)" }, beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>
