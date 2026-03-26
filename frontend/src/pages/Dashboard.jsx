import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import API from '../api';
import { getSentimentVisual, sentimentScore, normalizeSentiment } from "../utils/sentiment";

// Register ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterSpam, setFilterSpam] = useState("All");
  const user = localStorage.getItem("user");

  const [isLoading, setIsLoading] = useState(true);
  const modalVisual = selectedEmail ? getSentimentVisual(selectedEmail.sentiment) : null;
  const modalSentimentLabel = selectedEmail ? normalizeSentiment(selectedEmail.sentiment) : "";

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetch(`${API}/history/${encodeURIComponent(user)}`)
        .then(res => new Promise(resolve => setTimeout(() => resolve(res.json()), 1000)))
        .then(data => setHistory(data))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleTakeAction = async () => {
    if (!selectedEmail) return;
    setIsGenerating(true);
    setGeneratedResponse("");

    try {
      const res = await fetch(`${API}/generate-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: selectedEmail.intent,
          sentiment: selectedEmail.sentiment,
          priority: selectedEmail.priority
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

  const handleSpamFeedback = async (isSpam) => {
    if (!selectedEmail) return;
    try {
      const res = await fetch(`${API}/feedback/spam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedEmail.id,
          is_spam: isSpam
        })
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(prev => prev.map(item => 
          item.id === selectedEmail.id 
            ? { ...item, is_spam: isSpam, user_feedback: 'spam_corrected' } 
            : item
        ));
        setSelectedEmail(prev => ({ ...prev, is_spam: isSpam, user_feedback: 'spam_corrected' }));
        alert(data.message || "Feedback recorded. Model adapted!");
      } else {
        alert("Failed to update feedback.");
      }
    } catch (err) {
      console.error("Failed to update spam feedback:", err);
    }
  };

  if (!user) return <h2 className="center">Please Login to View Dashboard</h2>;

  // --- Statistics Calculation ---
  const totalEmails = history.length;
  const highPriorityCount = history.filter(h => h.priority === "High").length;
  const avgSentiment = history.length > 0
    ? (history.reduce((acc, curr) => acc + sentimentScore(curr.sentiment), 0) / history.length).toFixed(0)
    : 0;

  // --- Chart Data Preparation ---
  const intentCounts = history.reduce((acc, curr) => {
    acc[curr.intent] = (acc[curr.intent] || 0) + 1;
    return acc;
  }, {});

  const filteredHistory = history.slice(0, 7); // Show max 7 recent items natively

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
    labels: history.slice(0, 39).reverse().map((_, i) => i + 1), // Last 39 emails
    datasets: [
      {
        label: 'Sentiment Score (Last 39)',
        data: history.slice(0, 39).reverse().map(h => sentimentScore(h.sentiment)),
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
          <span className="stat-label">Spam Detected</span>
          <span className="stat-value" style={{ color: history.filter(h => h.is_spam).length > 0 ? '#f87171' : '#34d399' }}>
            {history.filter(h => h.is_spam).length}
          </span>
          <span className="stat-trend" style={{ color: '#f87171' }}>Flagged Emails</span>
        </motion.div>



        {/* Main Chart Area */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="main-chart-card">
          <div style={{ position: 'relative', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '36px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', position: 'absolute', left: 0 }}>Sentiment Trends</h3>
            <motion.div
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            >
              <a
                href="#recent-activity"
                style={{ color: '#a855f7', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', background: 'rgba(168, 85, 247, 0.15)', padding: '8px 24px', borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.2)' }}
              >
                Scroll down to Recent Activity <span style={{ fontSize: '16px' }}>↓</span>
              </a>
            </motion.div>
          </div>
          <div style={{ height: '300px' }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div id="recent-activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="recent-activity-card" style={{ display: 'flex', flexDirection: 'column', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'nowrap', gap: '16px' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', whiteSpace: 'nowrap' }}>Recent Activity</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap', flex: 1, justifyContent: 'flex-end', overflowX: 'auto', paddingBottom: '4px' }}>
              <a
                href="/history"
                className="btn-primary"
                style={{ textDecoration: 'none', padding: '6px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>📜</span> Full Historical Audit →
              </a>
            </div>
          </div>
          <div style={{ overflow: 'auto', flex: 1, paddingRight: '4px' }}>
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
              <div style={{ minWidth: '700px', paddingBottom: '8px', overflowX: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 100px 100px 160px', gap: '16px', padding: '0 16px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', paddingRight: '48px' }}>
                    <span style={{ transform: 'translateX(-90px)' }}>Emails</span>
                  </div>
                  <span style={{ transform: 'translateX(20px)' }}>Intent</span>
                  <span style={{ justifySelf: 'center' }}>Priority</span>
                  <span style={{ justifySelf: 'center' }}>Sentiment</span>
                </div>
                {filteredHistory.map((item, i) => {
                  const visuals = getSentimentVisual(item.sentiment);
                  const sentimentLabel = normalizeSentiment(item.sentiment);
                  return (
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                    key={i}
                    className="activity-item"
                    style={{
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(300px, 1fr) 100px 100px 160px',
                      gap: '16px',
                      padding: '16px',
                      alignItems: 'flex-start',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.15)' : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                    onClick={() => setSelectedEmail(item)}
                  >
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', paddingRight: '48px' }}>
                      <div style={{
                        width: '3px',
                        height: 'auto',
                        borderRadius: '2px',
                        backgroundColor: visuals.color,
                        marginTop: '0px',
                        flexShrink: 0
                      }} />
                      <span className="no-invert" style={{ fontSize: '16px', flexShrink: 0, width: '16px', textAlign: 'center', marginTop: '2px' }}>
                        {visuals.icon}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                        <span style={{ maxWidth: '560px', fontWeight: '500', fontSize: '14px', color: '#f1f5f9', lineHeight: '1.5', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.email}
                        </span>
                        {item.created_at && (
                          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 500, opacity: 0.85 }}>
                            <span className="no-invert">🕐</span> {item.created_at}
                          </span>
                        )}
                      </div>
                    </div>

                    <span style={{
                      color: '#e2e8f0',
                      textTransform: 'capitalize',
                      fontSize: '12px',
                      justifySelf: 'center',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      textAlign: 'center',
                      display: 'inline-block',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.intent.replace('_', ' ')}
                    </span>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      justifySelf: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#f8fafc',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: item.priority === 'High' ? 'rgba(248, 113, 113, 0.1)' : (item.priority === 'Medium' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(52, 211, 153, 0.1)'),
                      border: `1px solid ${item.priority === 'High' ? 'rgba(248, 113, 113, 0.25)' : (item.priority === 'Medium' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(52, 211, 153, 0.25)')}`,
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      whiteSpace: 'nowrap'
                    }}>
                      <span style={{
                        display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: item.priority === 'High' ? '#f87171' : (item.priority === 'Medium' ? '#fbbf24' : '#34d399'),
                        boxShadow: `0 0 8px ${item.priority === 'High' ? 'rgba(248,113,113,0.6)' : (item.priority === 'Medium' ? 'rgba(251,191,36,0.6)' : 'rgba(52,211,153,0.6)')}`
                      }}></span>
                      {item.priority}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', justifySelf: 'center' }}>
                      <span style={{
                        fontSize: '12px',
                        color: visuals.color,
                        fontWeight: '600',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        backgroundColor: visuals.bg,
                        border: `1px solid ${visuals.border}`,
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        textAlign: 'center',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}>
                        {sentimentLabel}
                      </span>
                      {item.is_spam && (
                        <span style={{
                          fontSize: '11px',
                          color: '#ef4444',
                          fontWeight: '600',
                          padding: '4px 8px',
                          borderRadius: '16px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span className="no-invert">🚨</span> Spam
                        </span>
                      )}
                    </div>
                  </motion.div>
                )})}
              </div>
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
                        color: modalVisual?.color
                      }}
                    >
                      {modalSentimentLabel}
                    </span>
                  </div>
                  <div className="modal-meta-item">
                    <span className="modal-label">Priority</span>
                    <span className="modal-value" style={{ color: selectedEmail.priority === 'High' ? '#f87171' : (selectedEmail.priority === 'Medium' ? '#fbbf24' : '#34d399') }}>
                      {selectedEmail.priority}
                    </span>
                  </div>
                  {selectedEmail.created_at && (
                    <div className="modal-meta-item">
                      <span className="modal-label">Analyzed At</span>
                      <span className="modal-value" style={{ color: '#94a3b8', fontSize: '12px' }}>{selectedEmail.created_at}</span>
                    </div>
                  )}
                  {selectedEmail.user_feedback && (
                    <div className="modal-meta-item">
                      <span className="modal-label">Your Feedback</span>
                      <span className="modal-value">
                        {selectedEmail.user_feedback === 'helpful' ? '👍 Helpful' : (selectedEmail.user_feedback === 'corrected' ? '🛠️ Corrected' : '👎 Not Helpful')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Spam Badge */}
                {selectedEmail.is_spam && (
                  <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="no-invert" style={{ fontSize: '18px' }}>🚨</span>
                    <div>
                      <p style={{ margin: 0, color: '#f87171', fontWeight: 700, fontSize: '13px' }}>Spam Detected</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>This email shows strong spam indicators. Treat with caution.</p>
                    </div>
                  </div>
                )}

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
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', color: '#f8fafc', textTransform: 'capitalize', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                            <li key={idx} style={{ marginBottom: '6px' }}>
                              {item.includes('🚨') ? (
                                <><span className="no-invert">🚨</span> {item.replace('🚨', '')}</>
                              ) : item.includes('✨') ? (
                                <><span className="no-invert">✨</span> {item.replace('✨', '')}</>
                              ) : item}
                            </li>
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
