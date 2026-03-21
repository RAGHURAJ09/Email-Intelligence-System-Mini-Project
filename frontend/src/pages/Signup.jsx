import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";
import { playSound } from "../utils/soundEffects";
import Captcha from "../components/Captcha";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const signup = async () => {
    if (!username.trim() || !password) {
      playSound('error');
      alert("Please enter both a username and password.");
      return;
    }

    if (username.trim().length < 3) {
      playSound('error');
      alert("Username must be at least 3 characters long.");
      return;
    }

    if (!captchaValid) {
      playSound('error');
      alert("Please complete the security captcha correctly before creating an account.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      playSound('error');
      alert("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    try {
      // 1. Register manually in Flask backend for local history link
      const res = await fetch("http://127.0.0.1:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();

      if (data.message && !data.error) {
        playSound('success');
        localStorage.setItem("user", username);
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }
        alert("Account created successfully! You can now log in.");
        window.location.href = "/login";
      } else {
        playSound('error');
        alert("Signup failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      playSound('error');
      alert("Error during signup");
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="auth-title">Get Started</h2>
        <p className="auth-sub">Create your account to start analyzing emails</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Captcha onVerify={setCaptchaValid} />

          <button className="btn-primary" onClick={signup} style={{ width: '100%', marginTop: '8px' }}>
            Create Account
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ padding: '0 10px', color: '#64748b', fontSize: '12px', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          className="btn-secondary"
          onClick={handleGoogleSignup}
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
          Sign up with Google
        </button>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Already have an account?
          <a href="/login" style={{ color: '#6366f1', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}>
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
