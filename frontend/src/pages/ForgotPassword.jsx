import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";
import { playSound } from "../utils/soundEffects";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !email.includes("@")) {
      playSound('error');
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (!error) {
        playSound('success');
        setStatus("✅ If an account exists with that email, a password reset link has been sent.");
      } else {
        playSound('error');
        setStatus("❌ " + (error.message || "Failed to send reset email."));
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
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-sub">Enter your email to receive a recovery link.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button 
            className="btn-primary" 
            onClick={handleReset} 
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {status && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: status.includes('❌') ? '#f87171' : '#10b981', textAlign: 'center' }}>
              {status}
            </p>
          )}
        </div>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Remember your password?
          <a href="/login" style={{ color: '#6366f1', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}>
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
