import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import { analyzeEmail } from "../api";
import { useBackground } from "../context/BackgroundContext";
import { playSound } from "../utils/soundEffects";
import { getSentimentVisual, normalizeSentiment, sentimentTone } from "../utils/sentiment";

export default function Home() {
  // States
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [recordId, setRecordId] = useState(null);
  
  // Correction State
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionData, setCorrectionData] = useState({ intent: '', sentiment: '', priority: '' });
  const [correctionSent, setCorrectionSent] = useState(false);

  const user = localStorage.getItem("user");
  const resultRef = useRef(null);
  const { setBgState } = useBackground();

  useEffect(() => {
    return () => setBgState('default');
  }, []);

  const handleStart = () => {
    setShowAnalyzer(true);
  };

  const submit = async () => {
    if (!email.trim()) {
      playSound('error');
      setNotification("❌ Please paste some text to analyze.");
      setTimeout(() => setNotification(""), 2000);
      return;
    }

    if (email.trim().length < 10) {
      playSound('error');
      setNotification("❌ Text is too short for accurate AI analysis.");
      setTimeout(() => setNotification(""), 2500);
      return;
    }
    setLoading(true);
    setResult(null);
    setFeedbackSent(false);
    setRecordId(null);
    setCorrectionMode(false);
    setCorrectionSent(false);

    // Artificial delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const data = await analyzeEmail(email, user);
      setResult(data);
      if (data.record_id) setRecordId(data.record_id);
      // Play smart real-time audio feedback based on analysis logic
      if (data && data.priority === 'High') {
        playSound('high-priority');
      } else if (data && data.sentiment) {
        const tone = sentimentTone(data.sentiment);
        playSound(tone === 'mixed' ? 'neutral' : tone);
        setBgState(normalizeSentiment(data.sentiment));
      }
      // Show custom notification
      setNotification("✅ Analysis Complete!");
      setTimeout(() => setNotification(""), 1500);

      // Scroll to result slightly
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      console.error("Analysis failed:", error);
      playSound('error');
      setNotification("❌ Analysis Failed. Please try again.");
      setTimeout(() => setNotification(""), 2000); // Give errors slightly longer to be read
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setEmail("");
    setResult(null);
    setFeedbackSent(false);
    setRecordId(null);
    setCorrectionMode(false);
    setCorrectionSent(false);
    setBgState('default');
  };

  const submitFeedback = async (type) => {
    if (!recordId || feedbackSent) return;
    setFeedbackSent(true);

    if (type === 'not_helpful') {
      setCorrectionMode(true);
      setCorrectionData({
        intent: result?.intent || 'Query',
        sentiment: result?.sentiment || 'Neutral',
        priority: result?.priority || 'Low'
      });
    }

    try {
      await fetch("http://127.0.0.1:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, feedback: type })
      });
    } catch (e) { console.error(e); }
  };

  const submitCorrection = async () => {
    if (!recordId) return;
    setCorrectionSent(true);
    setCorrectionMode(false);
    try {
      await fetch("http://127.0.0.1:5000/api/feedback/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recordId,
          intent: correctionData.intent,
          sentiment: correctionData.sentiment,
          priority: correctionData.priority
        })
      });
      playSound('high-priority'); // success chime
      setNotification("✅ AI Model Training Queue Updated!");
      setTimeout(() => setNotification(""), 2000);
    } catch (e) {
      console.error(e);
      setCorrectionSent(false);
    }
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!showAnalyzer ? (
        <Hero onStart={handleStart} />
      ) : (
        <motion.div
          className="analyzer-container"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ padding: "120px 20px 60px 20px" }}
        >
          <div className="analyzer-card" style={{ width: "100%", maxWidth: "800px" }}>
            <h2 className="analyzer-heading">Email Intelligence Analyzer</h2>
            <p className="text-muted" style={{ textAlign: 'center', marginBottom: '32px' }}>
              Paste customer communication below to extract intent, sentiment, and priority simultaneously.
            </p>

            {/* Sample Email Chips */}
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Try a sample:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  {
                    label: '🚨 Spam Email',
                    text: "Congratulations! You have been selected as a lucky winner of $1,000,000 prize! Click this link now to claim your reward: www.free-prize-claim.xyz. Act fast, offer expires in 24 hours! Call +1-800-FREE-WIN to verify your identity. This is not a scam, guaranteed!"
                  },
                  {
                    label: '😠 Refund Request',
                    text: "I am extremely disappointed with my recent purchase. The product arrived broken and the packaging was damaged. I have been a loyal customer for 5 years and this is unacceptable. I want a full refund immediately or I will escalate this to consumer court."
                  },
                  {
                    label: '😊 Positive Feedback',
                    text: "I just wanted to say how amazing your customer support team is! Sarah helped me resolve my billing issue within minutes. The service was incredibly fast and friendly. I will definitely recommend your company to all my friends and family."
                  },
                  {
                    label: '❓ Product Query',
                    text: "Hello, I would like to know more about the premium subscription plan. Can you please provide details about what features are included and whether there is a free trial available? Also, is there a student discount?"
                  }
                ].map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => setEmail(sample.text)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#94a3b8',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.15)'; e.target.style.color = '#a5b4fc'; e.target.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#94a3b8'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <span className="no-invert" style={{marginRight: '4px'}}>{sample.label.split(' ')[0]}</span> {sample.label.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="tech-textarea"
              style={{ minHeight: "180px", fontSize: "16px", lineHeight: "1.6" }}
              placeholder="Paste a customer email here, or click a sample above to try..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="btn-group">
              <button
                onClick={submit}
                className="btn-primary"
                disabled={loading || !email}
                style={{ opacity: loading || !email ? 0.6 : 1 }}
              >
                {loading ? "Analyzing..." : "Run Analysis"}
              </button>
              <button
                onClick={reset}
                className="btn-secondary"
                disabled={loading}
              >
                Clear
              </button>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  ref={resultRef}
                  className="result-card-modern"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="result-row">
                    <span className="result-key">Detected Intent</span>
                    <span className="result-val">{result.intent}</span>
                  </div>

                  <div className="result-row">
                    <span className="result-key">Sentiment Analysis</span>
                    {(() => {
                      const visuals = getSentimentVisual(result.sentiment);
                      const sentimentLabel = normalizeSentiment(result.sentiment);
                      return (
                    <span
                      className="result-val"
                      style={{
                        color: visuals.color
                      }}
                    >
                      {sentimentLabel}
                      {result.sentiment_strength ? ` • ${result.sentiment_strength}%` : ""}
                    </span>
                      );
                    })()}
                  </div>

                  <div className="result-row">
                    <span className="result-key">Priority Level</span>
                    <span
                      className={`activity-badge priority-${result.priority.toLowerCase()}`}
                      style={{ fontSize: '14px', padding: '4px 12px' }}
                    >
                      {result.priority}
                    </span>
                  </div>

                  <div className="result-row">
                    <span className="result-key">Confidence Score</span>
                    <span className="result-val">{result.confidence}%</span>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="result-key" style={{ display: 'block', marginBottom: '12px', color: '#a78bfa', fontSize: '16px' }}>Detailed Insights & Action Plan</span>

                    {result.detailed_feedback ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>DETECTED TONES</span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {result.detailed_feedback.tone_descriptors.map((tone, idx) => (
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0', textTransform: 'capitalize' }}>
                                {tone}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>ACTION ITEMS</span>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6' }}>
                            {result.detailed_feedback.action_items.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', color: '#e2e8f0' }}>
                        {result.priority === 'High'
                          ? "Escalate to senior support team immediately. Draft apology response."
                          : (sentimentTone(result.sentiment) === 'negative' ? "Flag for follow-up review. Monitor customer satisfaction." : "Standard response protocol applies.")
                        }
                      </p>
                    )}
                  </div>
                  {/* Spam Badge */}
                  {result.is_spam && (
                    <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="no-invert" style={{ fontSize: '18px' }}>🚨</span>
                      <div>
                        <p style={{ margin: 0, color: '#f87171', fontWeight: 700, fontSize: '13px' }}>Spam Detected</p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>This email shows strong spam indicators. Treat with caution.</p>
                      </div>
                    </div>
                  )}

                  {/* User Feedback */}
                  {recordId && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                      {feedbackSent && !correctionMode && !correctionSent ? (
                         <p style={{ color: '#10b981', fontSize: '13px', margin: 0 }}>✅ Thanks for your feedback! It helps improve our AI.</p>
                      ) : correctionSent ? (
                         <p style={{ color: '#10b981', fontSize: '13px', margin: 0 }}>✅ Model retrained with your correction automatically. Thank you!</p>
                      ) : correctionMode ? (
                        <div style={{ marginTop: '12px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                           <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#e2e8f0', fontWeight: 'bold' }}>Help us improve. What are the correct labels?</p>
                           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '12px', marginBottom: '16px' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Intent</label>
                               <select value={correctionData.intent} onChange={e => setCorrectionData({...correctionData, intent: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}>
                                 <option value="Issue" style={{ background: '#1e293b' }}>Issue</option>
                                 <option value="Query" style={{ background: '#1e293b' }}>Query</option>
                                 <option value="Refund" style={{ background: '#1e293b' }}>Refund</option>
                                 <option value="Escalation" style={{ background: '#1e293b' }}>Escalation</option>
                                 <option value="Feedback" style={{ background: '#1e293b' }}>Feedback</option>
                               </select>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Sentiment</label>
                             <select value={correctionData.sentiment} onChange={e => setCorrectionData({...correctionData, sentiment: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}>
                                 <option value="Very Positive" style={{ background: '#1e293b' }}>Very Positive</option>
                                 <option value="Positive" style={{ background: '#1e293b' }}>Positive</option>
                                 <option value="Slightly Positive" style={{ background: '#1e293b' }}>Slightly Positive</option>
                                 <option value="Neutral" style={{ background: '#1e293b' }}>Neutral</option>
                                 <option value="Mixed" style={{ background: '#1e293b' }}>Mixed</option>
                                 <option value="Slightly Negative" style={{ background: '#1e293b' }}>Slightly Negative</option>
                                 <option value="Negative" style={{ background: '#1e293b' }}>Negative</option>
                                 <option value="Very Negative" style={{ background: '#1e293b' }}>Very Negative</option>
                               </select>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Priority</label>
                               <select value={correctionData.priority} onChange={e => setCorrectionData({...correctionData, priority: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}>
                                 <option value="High" style={{ background: '#1e293b' }}>High</option>
                                 <option value="Medium" style={{ background: '#1e293b' }}>Medium</option>
                                 <option value="Low" style={{ background: '#1e293b' }}>Low</option>
                               </select>
                             </div>
                           </div>
                           <button className="btn-primary" onClick={submitCorrection} style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
                             Train Model with Correction
                           </button>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '10px' }}>Was this analysis helpful?</p>
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                              onClick={() => submitFeedback('helpful')}
                              style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)', color: '#10b981', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                            >👍 Helpful</button>
                            <button
                              onClick={() => submitFeedback('not_helpful')}
                              style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                            >👎 Not Helpful</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Custom Centered Main Notification Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              style={{
                pointerEvents: 'auto',
                padding: '16px 32px', // Slightly smaller
                background: notification.includes('❌') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                backdropFilter: 'blur(40px) saturate(150%)', // Glossy heavy frosted glass
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                border: notification.includes('❌') ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(16, 185, 129, 0.6)',
                borderTop: notification.includes('❌') ? '1px solid rgba(255, 150, 150, 0.6)' : '1px solid rgba(150, 255, 180, 0.6)', // Bright top edge for gloss
                color: '#f8fafc',
                borderRadius: '16px', // Tighter rounding
                boxShadow: '0 25px 50px rgba(0,0,0,0.7), inset 0 2px 20px rgba(255,255,255,0.08)', // Internal glossy rim
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '16px', // Smaller text
                letterSpacing: '0.5px',
                minWidth: '280px' // Smaller min width
              }}
            >
              <span style={{ fontSize: '22px' }}>{notification.includes('❌') ? '❌' : '✨'}</span>
              <span>{notification.replace('✅ ', '').replace('❌ ', '')}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
