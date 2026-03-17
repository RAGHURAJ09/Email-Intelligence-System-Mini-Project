import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";
import { playSound } from "../utils/soundEffects";
import Captcha from "../components/Captcha";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const login = async () => {
    if (!username.trim() || !password) {
      playSound('error');
      alert("Please enter both username and password.");
      return;
    }

    if (!captchaValid) {
      playSound('error');
      alert("Please complete the security captcha correctly before signing in.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.message && !data.error) {
        playSound('success');
        localStorage.setItem("user", username);
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        window.location.href = "/";
      } else {
        playSound('error');
        alert("Invalid login: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      playSound('error');
      alert("Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google"
    });
    if (error) console.log(error);
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Enter your credentials to access the platform</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Captcha onVerify={setCaptchaValid} />

          <button className="btn-primary" onClick={login} style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ padding: '0 10px', color: '#64748b', fontSize: '12px', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          className="btn-secondary"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'white',
            color: '#334155',
            border: '1px solid #e2e8f0'
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: '18px', height: '18px' }}
          />
          Sign in with Google
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            Forgot your password?
            <a href="/forgot-password" style={{ color: '#6366f1', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}>
              Reset it
            </a>
          </p>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
            Don't have an account?
            <a href="/signup" style={{ color: '#6366f1', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}>
              Create Account
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
