import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.message) {
      alert("Signup successful. Please login.");
      window.location.href = "/login";
    } else {
      alert(data.error || "Signup failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2>Create Account</h2>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button whileHover={{ scale: 1.05 }} onClick={signup}>
          Sign Up
        </motion.button>

        <p className="auth-text">
          Already have an account?
          <a href="/login" className="auth-link">Login</a>
        </p>
      </motion.div>
    </div>
  );
}
