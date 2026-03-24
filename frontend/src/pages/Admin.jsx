import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { fetchAdminHistory } from "../api";
import { motion } from "framer-motion";
import { normalizeSentiment, SENTIMENT_ORDER, getSentimentVisual } from "../utils/sentiment";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

export default function Admin() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const data = await fetchAdminHistory();
      if (data.error) {
        setError(data.error);
      } else {
        setHistory(data);
      }
    } catch (err) {
      setError("Failed to fetch admin analytics.");
    }
    setLoading(false);
  };

  if (loading) return <div className="center"><p>Loading system analytics...</p></div>;
  if (error) return (
    <div className="center">
      <div className="alert error" style={{ maxWidth: '400px' }}>
        <strong>Access Denied:</strong> {error}
        <br/><br/>
        Please ensure you are logged in with the username 'admin'.
      </div>
    </div>
  );

  // Stats calculation
  const totalEmails = history.length;
  
  // High severity counts
  const highPriority = history.filter(h => h.priority === "High").length;
  const spamCount = history.filter(h => h.is_spam || h.intent === "Spam").length;

  // Count intents
  const intentCounts = {};
  history.forEach(item => {
    intentCounts[item.intent] = (intentCounts[item.intent] || 0) + 1;
  });

  const intentChartData = {
    labels: Object.keys(intentCounts),
    datasets: [
      {
        label: "Global Intents",
        data: Object.values(intentCounts),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(14, 165, 233, 0.8)"
        ],
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1
      }
    ]
  };

  const sentimentCounts = {};
  SENTIMENT_ORDER.forEach(label => sentimentCounts[label] = 0);
  history.forEach(item => {
    const label = normalizeSentiment(item.sentiment);
    sentimentCounts[label] = (sentimentCounts[label] || 0) + 1;
  });

  const sentimentChartData = {
    labels: Object.keys(sentimentCounts),
    datasets: [
      {
        data: Object.values(sentimentCounts),
        backgroundColor: Object.keys(sentimentCounts).map(label => getSentimentVisual(label).color),
        borderWidth: 0
      }
    ]
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" } }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)', stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.5)' }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <motion.h1 
        className="hero-gradient-text" 
        style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'left' }}
      >
        System Analytics
      </motion.h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
        Global insight across all platform activities.
      </p>

      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ padding: '0', marginBottom: '24px' }}>
        <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="stat-label">System Traffic</div>
          <div className="stat-value">{totalEmails}</div>
          <div className="stat-trend" style={{ color: '#6366f1' }}>Total Emails Processed</div>
        </motion.div>

        <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="stat-label">Action Items</div>
          <div className="stat-value">{highPriority}</div>
          <div className="stat-trend" style={{ color: '#ef4444' }}>High Priority Operations</div>
        </motion.div>

        <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="stat-label">Security Controls</div>
          <div className="stat-value">{spamCount}</div>
          <div className="stat-trend" style={{ color: '#f59e0b' }}>Spam Threats Blocked</div>
        </motion.div>

        <motion.div className="stat-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="stat-label">Platform Health</div>
          <div className="stat-value">100%</div>
          <div className="stat-trend">Models operational</div>
        </motion.div>
      </div>

      <div className="dashboard-grid" style={{ padding: '0' }}>
        {/* Intents Distribution */}
        <motion.div 
          className="main-chart-card" 
          style={{ gridColumn: 'span 3', minHeight: '300px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <div className="stat-label">Global Intent Distribution</div>
          <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
             <Bar data={intentChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Sentiment Doughnut */}
        <motion.div 
          className="stat-card" 
          style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          <div className="stat-label">Aggregated Sentiment</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <div style={{ height: '220px', width: '220px' }}>
              <Doughnut 
                data={sentimentChartData} 
                options={{ 
                  maintainAspectRatio: false, 
                  plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', padding: 10 } } },
                  cutout: '70%'
                }} 
              />
            </div>
          </div>
        </motion.div>
        
        {/* Recent Admin Activity List */}
        <motion.div 
          className="recent-activity-card" 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
        >
          <div className="stat-label" style={{ marginBottom: '16px' }}>Network Activity Stream</div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
             {history.slice(0, 10).map((item, i) => (
                <div key={i} className="activity-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600' }}>USER: {item.user}</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>ID: #{item.id}</span>
                   </div>
                   <div style={{ fontSize: '13px', color: '#f8fafc', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.email}
                   </div>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`activity-badge ${item.priority === 'High' ? 'priority-high' : item.priority === 'Medium' ? 'priority-medium' : 'priority-low'}`}>
                        {item.priority} Priority
                      </span>
                      <span className="activity-badge">{item.intent}</span>
                   </div>
                </div>
             ))}
             {history.length === 0 && <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No network logs found.</div>}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
