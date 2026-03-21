import React, { useState } from "react";
import { motion } from "framer-motion";
import { playSound } from "../utils/soundEffects";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const handleReset = async () => {
    if (!email.trim() || !email.includes("@")) {
      playSound('error');
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("");
    setMaskedEmail("");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user_found === false) {
          playSound('error');
          setStatus("google_user");
        } else {
          playSound('success');
          setMaskedEmail(data.masked_email || email);
          setStatus("sent");
        }
      } else {
        playSound('error');
        setStatus("❌ " + (data.error || "Failed to send reset email."));
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

          {status === "sent" ? (
            <div style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '22px', marginBottom: '6px' }}>📬</p>
              <p style={{ fontSize: '14px', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
                Email sent!
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Reset link sent to{' '}
                <strong style={{
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  fontSize: '13px'
                }}>{maskedEmail}</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Check your inbox and spam folder.
              </p>
            </div>
          ) : status === "google_user" ? (
            <div style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#f87171', marginBottom: '6px', fontWeight: 600 }}>
                ❌ No local account found
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
                You may have signed up with Google, or no account exists with this email.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href="/signup"
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  + Create Account
                </a>
                <a
                  href="/login"
                  style={{
                    padding: '8px 16px',
                    background: 'white',
                    color: '#334155',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    style={{ width: '13px', height: '13px' }}
                  />
                  Login with Google
                </a>
              </div>
            </div>
          ) : status ? (
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#f87171', textAlign: 'center' }}>
              {status}
            </p>
          ) : null}
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
