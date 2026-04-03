import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import API from '../api';
import { getSentimentVisual, normalizeSentiment } from "../utils/sentiment";

export default function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterIntent, setFilterIntent] = useState("All");
  const [filterSpam, setFilterSpam] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("Newest");
  
  const itemsPerPage = 15;
  const user = localStorage.getItem("user");

  const handleExportCSV = async () => {
    if (!user) {
      alert("Please log in to export CSV");
      return;
    }
    setIsExporting(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(`${API}/export/${encodeURIComponent(user)}`, { 
        headers,
        credentials: 'include'
      });
      
      console.log('Export response status:', response.status);
      
      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        alert("You can only export your own data.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(errorData.error || `Export failed with status ${response.status}`);
        return;
      }
      
      const blob = await response.blob();
      console.log('Blob type:', blob.type, 'Blob size:', blob.size);
      
      if (blob.size === 0) {
        alert("No data to export.");
        setIsExporting(false);
        return;
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email_history.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again. Error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      fetch(`${API}/history/${encodeURIComponent(user)}`, { headers })
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to fetch history:", err))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  // Derived filtered data
  const filteredAndSortedHistory = useMemo(() => {
    let result = history.filter(item => {
      const matchesSearch = item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.intent.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === "All" || item.priority === filterPriority;
      const matchesIntent = filterIntent === "All" || item.intent.toLowerCase() === filterIntent.toLowerCase();
      const matchesSpam = filterSpam === "All" || (filterSpam === "Spam" ? item.is_spam : !item.is_spam);
      return matchesSearch && matchesPriority && matchesIntent && matchesSpam;
    });

    if (sortOrder === "Newest") {
      result = result.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
    } else if (sortOrder === "Oldest") {
      result = result.sort((a, b) => a.id - b.id);
    } else if (sortOrder === "Priority") {
      const pMap = { "High": 3, "Medium": 2, "Low": 1 };
      result = result.sort((a, b) => pMap[b.priority] - pMap[a.priority]);
    }

    return result;
  }, [history, searchTerm, filterPriority, filterIntent, filterSpam, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedHistory.length / itemsPerPage);
  const currentItems = filteredAndSortedHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!user) {
    return (
      <div className="center fade-in">
        <h2 className="title-gradient" style={{ fontSize: '32px' }}>Access Denied</h2>
        <p className="text-muted">Please log in to view your historical audit logs.</p>
        <a href="/login" className="btn-primary" style={{ textDecoration: 'none', marginTop: '16px' }}>Go to Login</a>
      </div>
    );
  }

  return (
    <main className="dashboard-container fade-in" style={{ padding: '100px 40px 40px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '36px', margin: '0 0 12px 0' }}>Historical Audit</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '15px' }}>
             Review, manage, and audit your entire email processing history below.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
             <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '10px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Records</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', lineHeight: '1' }}>{history.length}</span>
             </div>
              <button onClick={handleExportCSV} className="btn-primary" disabled={isExporting} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.6 : 1 }}>
                 <span className="no-invert">⬇️</span> {isExporting ? 'Exporting...' : 'Export CSV Archive'}
              </button>
        </div>
      </div>

      {/* Advanced Filter Action Bar */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
         className="dashboard-card" 
         style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '20px', marginBottom: '24px', alignItems: 'center', background: 'rgba(15, 15, 25, 0.4)' }}
      >
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            placeholder="Search email text or intents..."
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            style={{ width: '100%', paddingLeft: '44px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select className="tech-textarea" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ width: 'auto', padding: '12px 16px', minHeight: 'auto', background: 'rgba(0,0,0,0.3)' }}>
              <option value="Newest">Sort: Newest First</option>
              <option value="Oldest">Sort: Oldest First</option>
              <option value="Priority">Sort: Highest Priority</option>
            </select>

            <select className="tech-textarea" value={filterPriority} onChange={(e) => {setFilterPriority(e.target.value); setCurrentPage(1);}} style={{ width: 'auto', padding: '12px 16px', minHeight: 'auto', background: 'rgba(0,0,0,0.3)' }}>
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select className="tech-textarea" value={filterIntent} onChange={(e) => {setFilterIntent(e.target.value); setCurrentPage(1);}} style={{ width: 'auto', padding: '12px 16px', minHeight: 'auto', background: 'rgba(0,0,0,0.3)' }}>
              <option value="All">All Intents</option>
              <option value="refund">Refund</option>
              <option value="query">Query</option>
              <option value="issue">Issue</option>
              <option value="feedback">Feedback</option>
              <option value="escalation">Escalation</option>
            </select>

            <select className="tech-textarea" value={filterSpam} onChange={(e) => {setFilterSpam(e.target.value); setCurrentPage(1);}} style={{ width: 'auto', padding: '12px 16px', minHeight: 'auto', background: 'rgba(0,0,0,0.3)' }}>
              <option value="All">Filter: Spam Status</option>
              <option value="Spam">🚨 Spam Only</option>
              <option value="Not Spam">✅ Safe (Not Spam)</option>
            </select>
            
            {(searchTerm || filterPriority !== "All" || filterIntent !== "All" || filterSpam !== "All") && (
                <button 
                  onClick={() => {setSearchTerm(""); setFilterPriority("All"); setFilterIntent("All"); setFilterSpam("All");}}
                  className="btn-secondary" style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Clear Filters
                </button>
            )}
        </div>
      </motion.div>

      {/* Main Datatable UI */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Table Header Wrapper */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 140px 140px 180px 120px', gap: '20px', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: '600', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <span>Communication Content</span>
            <span style={{ textAlign: 'center' }}>Intent Group</span>
            <span style={{ textAlign: 'center' }}>Priority Level</span>
            <span style={{ textAlign: 'center' }}>Detected Sentiment</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Loading / Empty States */}
        {isLoading ? (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton-loader" style={{ height: '70px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}></div>
                ))}
            </div>
        ) : currentItems.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                <span className="no-invert" style={{ fontSize: '48px', display: 'block', marginBottom: '16px', opacity: 0.5 }}>📭</span>
                <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>No Records Found</h3>
                <p style={{ color: '#94a3b8', margin: 0 }}>Try adjusting your search or filter parameters.</p>
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {currentItems.map((item, idx) => {
                    const visuals = getSentimentVisual(item.sentiment);
                    const isHighRisk = item.is_spam || item.priority === "High";
                    
                    return (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            style={{ 
                                display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 140px 140px 180px 120px', gap: '20px', 
                                padding: '20px 24px', alignItems: 'center', 
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                borderLeft: `3px solid ${item.is_spam ? '#ef4444' : (item.priority === "High" ? '#f87171' : 'transparent')}`,
                                cursor: 'default'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: '500', color: '#f1f5f9', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.email.substring(0, 100)}{item.email.length > 100 ? '...' : ''}
                                    </span>
                                    {item.is_spam && <span className="activity-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', margin: 0 }}>Spam</span>}
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                                    Record ID #{item.id} • {item.created_at || 'Archived'}
                                </span>
                            </div>

                            <span style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '13px', textTransform: 'capitalize', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {item.intent.replace('_', ' ')}
                            </span>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500',
                                    color: item.priority === 'High' ? '#fca5a5' : (item.priority === 'Medium' ? '#fcd34d' : '#6ee7b7'),
                                    background: item.priority === 'High' ? 'rgba(248, 113, 113, 0.1)' : (item.priority === 'Medium' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(52, 211, 153, 0.1)'),
                                    padding: '6px 12px', borderRadius: '8px',
                                    border: `1px solid ${item.priority === 'High' ? 'rgba(248, 113, 113, 0.2)' : (item.priority === 'Medium' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(52, 211, 153, 0.2)')}`
                                }}>
                                    <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: item.priority === 'High' ? '#ef4444' : (item.priority === 'Medium' ? '#f59e0b' : '#10b981') }}></span>
                                    {item.priority}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                 <span style={{
                                     fontSize: '13px', fontWeight: '500', color: visuals.color, background: visuals.bg,
                                     border: `1px solid ${visuals.border}`, padding: '6px 16px', borderRadius: '99px',
                                     display: 'inline-flex', alignItems: 'center', gap: '8px'
                                 }}>
                                    <span style={{ filter: 'grayscale(0%)', fontSize: '14px' }}>{visuals.icon}</span> 
                                    {normalizeSentiment(item.sentiment)}
                                 </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => setSelectedEmail(item)}
                                  className="btn-secondary" 
                                  style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', background: 'transparent' }}
                                >
                                    Inspect Full
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        )}

        {/* Pagination Foot bar */}
        {!isLoading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedHistory.length)} of {filteredAndSortedHistory.length} results
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                       disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                       className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', opacity: currentPage === 1 ? 0.3 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>
                    {/* Page Numbers */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0 8px' }}>
                        {[...Array(totalPages)].map((_, i) => {
                            // Only show a sliding window of pages
                            if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)) {
                                return (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)}
                                        style={{ 
                                            background: currentPage === i + 1 ? 'var(--primary)' : 'transparent',
                                            color: currentPage === i + 1 ? '#fff' : '#94a3b8',
                                            border: currentPage === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '13px', fontWeight: '600'
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            } else if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                                return <span key={i} style={{ color: '#94a3b8', margin: '0 4px', fontSize: '10px' }}>•••</span>;
                            }
                            return null;
                        })}
                    </div>
                    <button 
                       disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                       className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', opacity: currentPage === totalPages ? 0.3 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </motion.div>


      {/* Dedicated Inspection Modal (Mirrors logic visually but tailored context) */}
      {selectedEmail && (
          <div className="modal-overlay" onClick={() => setSelectedEmail(null)} style={{ zIndex: 3000 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px' }}>Audit Inspection</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Record ID #{selectedEmail.id}</span>
                </div>
                <button className="modal-close" onClick={() => setSelectedEmail(null)}>×</button>
              </div>

              <div className="modal-body" style={{ padding: '24px' }}>
                {selectedEmail.is_spam && (
                  <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className="no-invert" style={{ fontSize: '20px' }}>🚨</span>
                    <div>
                      <p style={{ margin: 0, color: '#fca5a5', fontWeight: 700, fontSize: '14px' }}>SECURITY / SPAM FLAG</p>
                      <p style={{ margin: 0, color: '#fecaca', fontSize: '12px', opacity: 0.8 }}>This item was classified as spam via historical auditing.</p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Classification</span>
                        <span style={{ fontSize: '16px', color: '#a78bfa', fontWeight: '600', textTransform: 'capitalize' }}>{selectedEmail.intent.replace('_', ' ')}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Priority Level</span>
                        <span style={{ fontSize: '16px', color: selectedEmail.priority === 'High' ? '#fca5a5' : (selectedEmail.priority === 'Medium' ? '#fcd34d' : '#6ee7b7'), fontWeight: '600' }}>{selectedEmail.priority}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Sentiment Tone</span>
                        <span style={{ fontSize: '16px', color: getSentimentVisual(selectedEmail.sentiment).color, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <span className="no-invert">{getSentimentVisual(selectedEmail.sentiment).icon}</span>
                             {normalizeSentiment(selectedEmail.sentiment)}
                        </span>
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Raw Communication Payload</h4>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.7', color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedEmail.email}
                  </p>
                </div>
                
                {selectedEmail.detailed_feedback && selectedEmail.detailed_feedback.action_items && (
                   <div style={{ marginTop: '24px' }}>
                       <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Historical Action Items Detected</h4>
                       <ul style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '20px 20px 20px 40px', margin: 0, color: '#f8fafc', fontSize: '14px', lineHeight: '1.6' }}>
                          {selectedEmail.detailed_feedback.action_items.map((item, idx) => (
                             <li key={idx} style={{ marginBottom: '8px' }}>
                               {item.includes('🚨') ? <><span className="no-invert">🚨</span> {item.replace('🚨', '')}</> : item}
                             </li>
                          ))}
                       </ul>
                   </div>
                )}
                
                {selectedEmail.user_feedback && (
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <span style={{ color: '#38bdf8', fontSize: '13px', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Human Feedback Audited</span>
                        <span style={{ color: '#e0f2fe', fontSize: '15px' }}>
                            {selectedEmail.user_feedback === 'helpful' ? '👍 Verified as Helpful' : (selectedEmail.user_feedback === 'corrected' ? '🛠️ Classification Corrected by User' : '👎 Flagged as Not Helpful')}
                        </span>
                    </div>
                )}
              </div>
            </motion.div>
          </div>
      )}
    </main>
  );
}
