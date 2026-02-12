import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Hero({ onStart }) {
  const text = "AI-Powered Customer Email Intelligence System";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <section className="hero-tech">
      <motion.h1
        className="tech-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {displayText}
      </motion.h1>

      <p className="tech-subtitle">
        Analyze sentiment, intent, and priority with state-of-the-art AI.
      </p>

      <motion.button
        className="tech-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
      >
        INITIALIZE SYSTEM
      </motion.button>
    </section>
  );
}
