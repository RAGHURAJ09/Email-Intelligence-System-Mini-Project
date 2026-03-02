import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Hero({ onStart }) {
  const navigate = useNavigate();

  return (
    <section className="hero-tech">
      <motion.h1
        className="hero-gradient-text"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Intelligence for<br />Modern Support Teams
      </motion.h1>

      <motion.p
        className="hero-sub"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        Transform customer emails into actionable insights with AI-driven sentiment analysis and automated prioritization.
      </motion.p>

      <motion.div
        className="btn-group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <button
          className="btn-primary"
          style={{ padding: '16px 32px', fontSize: '16px' }}
          onClick={onStart}
        >
          Start Analysis
        </button>
        <button
          className="btn-secondary"
          style={{ padding: '16px 32px', fontSize: '16px' }}
          onClick={() => navigate('/documentation')}
        >
          View Documentation
        </button>
      </motion.div>
    </section>
  );
}
