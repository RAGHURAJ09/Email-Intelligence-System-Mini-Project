import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";
import { playSound } from "../utils/soundEffects";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user actually has a recovery session
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
         console.log("Password recovery event received.");
      }
    });
  }, []);

  const handleUpdate = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (!token) {
      playSound('error');
      alert("Invalid or missing reset token. Please request a new link.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      playSound('error');
      alert("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        playSound('success');
        setStatus("✅ Password updated successfully! Redirecting...");
        setTimeout(() => {
           navigate("/login");
        }, 2000);
      } else {
        playSound('error');
        setStatus("❌ " + (data.error || "Failed to update password."));
      }
    } catch (err) {
      console.error(err);
      playSound('error');
      setStatus("❌ An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="auth-title">Update Password</h2>
        <p className="auth-sub">Enter your new secure password.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button 
            className="btn-primary" 
            onClick={handleUpdate} 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {status && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: status.includes('❌') ? '#f87171' : '#10b981', textAlign: 'center' }}>
              {status}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
