import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const user = localStorage.getItem("user");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetch(`http://localhost:5000/api/history/${user}`)
        .then(res => res.json())
        .then(data => setHistory(data.reverse()))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleTakeAction = async () => {
    if (!selectedEmail) return;
    setIsGenerating(true);
    setGeneratedResponse("");

    try {
      const res = await fetch("http://localhost:5000/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: selectedEmail.intent,
          sentiment: selectedEmail.sentiment
        })
      });
      const data = await res.json();
      setGeneratedResponse(data.response);
    } catch (err) {
      console.error("Failed to generate response:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return <h2 className="center">Please Login to View Dashboard</h2>;

  // --- Statistics Calculation ---
  const totalEmails = history.length;
  const highPriorityCount = history.filter(h => h.priority === "High").length;
  const avgSentiment = history.length > 0
    ? (history.reduce((acc, curr) => acc + (curr.sentiment === "Positive" ? 100 : (curr.sentiment === "Negative" ? 0 : 50)), 0) / history.length).toFixed(0)
    : 0;

  // --- Chart Data Preparation ---
  const intentCounts = history.reduce((acc, curr) => {
    acc[curr.intent] = (acc[curr.intent] || 0) + 1;
    return acc;
  }, {});

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.intent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || item.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const doughnutData = {
    labels: Object.keys(intentCounts),
    datasets: [
      {
        data: Object.values(intentCounts),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)', // Indigo
          'rgba(168, 85, 247, 0.8)', // Purple
          'rgba(2ec4b6, 0.8)',       // Teal
          'rgba(236, 72, 153, 0.8)', // Pink
          'rgba(245, 158, 11, 0.8)', // Amber
        ],
        borderColor: 'rgba(17, 25, 40, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: history.slice(0, 25).reverse().map((_, i) => i + 1), // Last 25 emails
    datasets: [
      {
        label: 'Sentiment Score (Last 25)',
        data: history.slice(0, 25).reverse().map(h => h.sentiment === "Positive" ? 100 : (h.sentiment === "Negative" ? 20 : 60)),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8' } }
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  return (
    <main className="dashboard-container">
      <div className="dashboard-grid">
        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <span className="stat-label">Total Volume</span>
          <span className="stat-value">{totalEmails}</span>
          <span className="stat-trend">Emails Processed</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <span className="stat-label">Sentiment Score</span>
          <span className="stat-value">{avgSentiment}%</span>
          <span className="stat-trend" style={{ color: avgSentiment > 70 ? '#10b981' : '#f59e0b' }}>
            Average Positivity
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <span className="stat-label">Critical Issues</span>
          <span className="stat-value">{highPriorityCount}</span>
          <span className="stat-trend" style={{ color: '#f87171' }}>High Priority</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <span className="stat-label">System Status</span>
          <span className="stat-value" style={{ fontSize: '20px', color: '#10b981' }}>Operational</span>
          <span className="stat-trend">All systems normal</span>
        </motion.div>

        {/* Main Chart Area */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="main-chart-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc' }}>Sentiment Trends</h3>
          <div style={{ height: '300px' }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="recent-activity-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc' }}>Recent Activity</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '6px 12px', color: '#f8fafc', fontSize: '13px', outline: 'none',
                  minWidth: '150px'
                }}
              />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '6px 12px', color: '#f8fafc', fontSize: '13px', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="All" style={{ background: '#1e293b' }}>All Priorities</option>
                <option value="High" style={{ background: '#1e293b' }}>High Priority</option>
                <option value="Medium" style={{ background: '#1e293b' }}>Medium Priority</option>
                <option value="Low" style={{ background: '#1e293b' }}>Low Priority</option>
              </select>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {isLoading ? (
              // Skeleton Loaders
              [...Array(5)].map((_, idx) => (
                <div key={idx} className="activity-item skeleton-loader" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div className="skeleton-title" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                  <div className="skeleton-text" style={{ background: 'rgba(255,255,255,0.1)' }}></div>
                  <div className="skeleton-text" style={{ background: 'rgba(255,255,255,0.1)', width: '80%' }}></div>
                </div>
              ))
            ) : filteredHistory.length > 0 ? (
              // Actual Data
              filteredHistory.map((item, i) => (
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)", x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  key={i}
                  className="activity-item"
                  style={{
                    cursor: 'pointer',
                    borderLeft: `3px solid ${item.priority === 'High' ? '#f87171' : (item.priority === 'Medium' ? '#fbbf24' : '#34d399')}`
                  }}
                  onClick={() => setSelectedEmail(item)}
                >
                  <div className="activity-header">
                    <span className="activity-email" style={{ fontWeight: '500', lineHeight: '1.4' }}>
                      {item.email.substring(0, 90)}{item.email.length > 90 ? '...' : ''}
                    </span>
                    <span className={`activity-badge priority-${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                    <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ opacity: 0.6 }}>Intent:</span> <strong style={{ color: '#e2e8f0' }}>{item.intent}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '14px' }}>{item.sentiment === 'Positive' ? '😊' : (item.sentiment === 'Negative' ? '😠' : '😐')}</span>
                      <span style={{
                        color: item.sentiment === 'Positive' ? '#10b981' : (item.sentiment === 'Negative' ? '#f87171' : '#fbbf24'),
                        fontWeight: '500'
                      }}>
                        {item.sentiment}
                      </span>
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              // Empty State
              <div style={{ textAlign: 'center', margin: '40px 0', padding: '20px' }}>
                <span style={{ fontSize: '32px', opacity: 0.5, display: 'block', marginBottom: '10px' }}>📭</span>
                <p className="text-muted">
                  {history.length === 0 ? "No records found." : "No emails match your filter criteria."}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div >

      {/* Email Details Modal */}
      {
        selectedEmail && (
          <div className="modal-overlay" onClick={() => setSelectedEmail(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Email Intelligence</h3>
                <button className="modal-close" onClick={() => setSelectedEmail(null)}>×</button>
              </div>

              <div className="modal-body">
                <div className="modal-meta">
                  <div className="modal-meta-item">
                    <span className="modal-label">Intent</span>
                    <span className="modal-value" style={{ color: '#a78bfa' }}>{selectedEmail.intent}</span>
                  </div>
                  <div className="modal-meta-item">
                    <span className="modal-label">Sentiment</span>
                    <span
                      className="modal-value"
                      style={{
                        color: selectedEmail.sentiment === 'Positive' ? '#10b981' :
                          (selectedEmail.sentiment === 'Negative' ? '#f87171' : '#fbbf24')
                      }}
                    >
                      {selectedEmail.sentiment}
                    </span>
                  </div>
                  <div className="modal-meta-item">
                    <span className="modal-label">Priority</span>
                    <span
                      className="modal-value"
                      style={{
                        color: selectedEmail.priority === 'High' ? '#f87171' :
                          (selectedEmail.priority === 'Medium' ? '#fbbf24' : '#34d399')
                      }}
                    >
                      {selectedEmail.priority}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="modal-label" style={{ display: 'block', marginBottom: '8px' }}>Full Content</span>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#e2e8f0' }}>
                    {selectedEmail.email}
                  </p>
                </div>

                {selectedEmail.detailed_feedback?.action_items && (
                  <div style={{ marginTop: '20px', background: 'rgba(139, 92, 246, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <span className="modal-label" style={{ display: 'block', marginBottom: '12px', color: '#a78bfa' }}>Detailed Insights & Action Plan</span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedEmail.detailed_feedback.tone_descriptors && selectedEmail.detailed_feedback.tone_descriptors.length > 0 && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>DETECTED TONES</span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {selectedEmail.detailed_feedback.tone_descriptors.map((tone, idx) => (
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', color: '#e2e8f0', textTransform: 'capitalize' }}>
                                {tone}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>ACTION ITEMS</span>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>
                          {selectedEmail.detailed_feedback.action_items.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {generatedResponse && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                  >
                    <span className="modal-label" style={{ display: 'block', marginBottom: '8px', color: '#10b981' }}>Suggested Response</span>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#d1fae5', whiteSpace: 'pre-wrap' }}>
                      {generatedResponse}
                    </p>
                    <button
                      className="btn-secondary"
                      style={{ marginTop: '12px', fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => navigator.clipboard.writeText(generatedResponse)}
                    >
                      Copy to Clipboard
                    </button>
                  </motion.div>
                )}

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button className="btn-secondary" onClick={() => { setSelectedEmail(null); setGeneratedResponse(""); }}>Close</button>
                  <button
                    className="btn-primary"
                    onClick={handleTakeAction}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Response"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </main >
  );
}
