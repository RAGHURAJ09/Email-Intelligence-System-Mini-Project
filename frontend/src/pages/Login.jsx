import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.message) {
      localStorage.setItem("user", username);
      window.location.href = "/";
    } else {
      alert("Invalid login");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2>Login</h2>

        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button whileHover={{ scale: 1.05 }} onClick={login}>
          Login
        </motion.button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
          <span style={{ padding: '0 10px', color: '#888', fontSize: '0.9em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleGoogleLogin}
          style={{
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: '18px', height: '18px' }}
          />
          Sign in with Google
        </motion.button>

        <p className="auth-text">
          Don’t have an account?
          <a href="/signup" className="auth-link">Create Account</a>
        </p>
      </motion.div>
    </div>
  );
}
