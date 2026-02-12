import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/history/${user}`)
        .then(res => res.json())
        .then(data => setHistory(data));
    }
  }, [user]);

  const getPriorityColor = (priority) => {
    if (priority === "High") return "#ef4444"; // Red
    if (priority === "Low") return "#00ff41";  // Green
    return "#00bfff"; // Blue (Default/Medium)
  };

  if (!user) return <h2 className="center">Login required</h2>;

  return (
    <main className="center" style={{ width: '100%', alignItems: 'center', boxSizing: 'border-box', padding: '20px' }}>
      <h1 className="tech-heading" style={{ marginTop: '20px' }}>EMAIL INTELLIGENCE LOGS</h1>

      {history.length === 0 && <p style={{ color: '#00ff41', fontFamily: 'Courier New' }}>NO_LOGS_FOUND_</p>}

      <div className="card-grid fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        {history.map((item, i) => (
          <div
            key={i}
            className="tech-history-card slide-up"
            style={{
              borderLeft: `4px solid ${getPriorityColor(item.priority)}`,
              boxShadow: `0 0 10px ${getPriorityColor(item.priority)}20`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', color: '#cbd5f5' }}>
              <span style={{ color: getPriorityColor(item.priority), fontWeight: 'bold' }}>#{history.length - i}</span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>LOG_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: '#ccc', fontSize: '10px', fontFamily: 'Arial, sans-serif' }}>Content</span>
              <p style={{ margin: '2px 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                {item.email}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <span style={{ color: '#ccc', fontSize: '10px', fontFamily: 'Arial, sans-serif' }}>Intent</span>
                <div style={{ color: getPriorityColor(item.priority), fontSize: '14px' }}>{item.intent}</div>
              </div>
              <div>
                <span style={{ color: '#ccc', fontSize: '10px', fontFamily: 'Arial, sans-serif' }}>Priority</span>
                <div style={{ color: getPriorityColor(item.priority), fontWeight: 'bold', fontSize: '14px' }}>{item.priority}</div>
              </div>
              <div>
                <span style={{ color: '#ccc', fontSize: '10px', fontFamily: 'Arial, sans-serif' }}>Sentiment</span>
                <div style={{ color: '#fff', fontSize: '14px' }}>{item.sentiment}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
