import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Admin() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/history/admin")
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  // Count intents
  const counts = {};
  history.forEach(item => {
    counts[item.intent] = (counts[item.intent] || 0) + 1;
  });

  const chartData = {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Email Intents",
        data: Object.values(counts),
        backgroundColor: "#22c55e"
      }
    ]
  };

  return (
    <main className="dashboard">
      <h1>🛠 Admin Analytics</h1>

      <div style={{ width: "500px", margin: "40px auto" }}>
        <Bar data={chartData} />
      </div>
    </main>
  );
}
