import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import { analyzeEmail } from "../api";
import { useBackground } from "../context/BackgroundContext";
import { playSound } from "../utils/soundEffects";

export default function Home() {
  // States
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!email) return;
    setLoading(true);
    setResult(null);

    // Artificial delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const data = await analyzeEmail(email, user);
      setResult(data);
      playSound('success');
      if (data && data.sentiment) {
        setBgState(data.sentiment);
      }
      // Scroll to result slightly
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (error) {
      console.error("Analysis failed:", error);
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setEmail("");
    setResult(null);
    setBgState('default');
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

            <textarea
              className="tech-textarea" // Retaining utility class for styling
              style={{ minHeight: "180px", fontSize: "16px", lineHeight: "1.6" }}
              placeholder="e.g., 'I am very frustrated with the recent downtime and would like to request a refund immediately...'"
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
                    <span
                      className="result-val"
                      style={{
                        color: result.sentiment === "Positive" ? "#10b981" :
                          (result.sentiment === "Negative" ? "#f87171" : "#fbbf24")
                      }}
                    >
                      {result.sentiment}
                    </span>
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

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="result-key" style={{ display: 'block', marginBottom: '8px' }}>Recommended Action</span>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', color: '#e2e8f0' }}>
                      {result.priority === 'High'
                        ? "Escalate to senior support team immediately. Draft apology response."
                        : (result.sentiment === 'Negative' ? "Flag for follow-up review. Monitor customer satisfaction." : "Standard response protocol applies.")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
