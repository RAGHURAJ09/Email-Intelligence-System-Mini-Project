import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import Loader from "../components/Loader";
import { analyzeEmail } from "../api";
import { useBackground } from "../context/BackgroundContext";
import { playSound } from "../utils/soundEffects";

export default function Home() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setBgState } = useBackground();
  const user = localStorage.getItem("user");

  const getPriorityColor = (priority) => {
    if (priority === "High") return "#ef4444"; // Red
    if (priority === "Low") return "#00ff41";  // Green
    return "#00bfff"; // Blue (Default/Medium)
  };

  const handleStart = () => {
    playSound('click');
    setShowAnalyzer(true);
  };

  const submit = async () => {
    if (!email) return;
    playSound('click');
    setLoading(true);
    setResult(null);

    // Artificial delay for "processing" effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const data = await analyzeEmail(email, user);
      setResult(data);
      playSound('success');

      // User: "Result Low" -> Green, "Result High" -> Red.
      if (data.priority === "High") {
        setBgState("high"); // Result is high -> Red
      } else if (data.priority === "Low" || data.priority === "Medium") {
        setBgState("low");  // Result is low -> Green
      } else {
        setBgState("default"); // Default -> Skyblue
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    playSound('reset');
    setEmail("");
    setResult(null);
    setBgState("default");
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!showAnalyzer && <Hero onStart={handleStart} />}

      <AnimatePresence>
        {showAnalyzer && (
          <motion.div
            className="analyzer-container" // New container class
            initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            style={{ marginTop: "10vh" }}
          >
            <div className="analyzer-card"> {/* Inner Card */}
              <h1 className="tech-heading">Email Analyzer</h1>

              <textarea
                className="tech-textarea" // New input class
                placeholder="Paste user email content here for analysis..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="btn-group">
                <button
                  onClick={submit}
                  className="btn-tech-action" // New button class
                  onMouseEnter={() => playSound('hover')}
                  disabled={loading}
                >
                  {loading ? "SCANNING..." : "ANALYZE"}
                </button>
                <button
                  onClick={reset}
                  className="btn-tech-reset" // New button class
                  onMouseEnter={() => playSound('hover')}
                  disabled={loading}
                >
                  RESET
                </button>
              </div>

              {loading && <Loader />}

              <AnimatePresence>
                {result && !loading && (
                  <motion.div
                    className="tech-result-card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="result-header" style={{ borderBottom: `1px solid ${getPriorityColor(result.priority)}` }}>
                      <h3>Analysis Results</h3>
                      <span className="result-id">#{Math.floor(Math.random() * 1000)}</span>
                    </div>

                    <div className="result-grid">
                      <div className="result-item">
                        <span className="result-label">Intent</span>
                        <p className="result-value" style={{ color: getPriorityColor(result.priority) }}>{result.intent}</p>
                      </div>
                      <div className="result-item">
                        <span className="result-label">Sentiment</span>
                        <p className="result-value" style={{ color: getPriorityColor(result.priority) }}>{result.sentiment}</p>
                      </div>
                    </div>

                    <div className="result-priority-section">
                      <div className="result-priority-header">
                        <span className="result-label">Priority</span>
                        <span className="result-priority-value" style={{ color: getPriorityColor(result.priority) }}>{result.priority}</span>
                      </div>

                      <div className="priority-bar-bg">
                        <motion.div
                          className="priority-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.8, ease: "circOut" }}
                          style={{
                            background: getPriorityColor(result.priority),
                            boxShadow: `0 0 15px ${getPriorityColor(result.priority)}`
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
