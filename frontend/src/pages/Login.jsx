import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";
import { playSound } from "../utils/soundEffects";
import Captcha from "../components/Captcha";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOauthFlow, setIsOauthFlow] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_2fa') === 'true' && localStorage.getItem('pending_oauth_user')) {
      setOtpMode(true);
      setIsOauthFlow(true);
      // We do not require a captcha for merely entering an OTP side-channel after a valid OAuth verification.
      setCaptchaValid(true); 
    }
  }, []);

  const login = async () => {
    if (isOauthFlow) {
      if (!otp.trim()) {
         playSound('error');
         alert("Please enter the 2FA code.");
         return;
      }
      try {
        const payload = {
          username: localStorage.getItem('pending_oauth_user'),
          otp: otp,
          is_oauth: true
        };
        const res = await fetch("http://127.0.0.1:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        
        if (data.message && !data.error) {
          playSound('success');
          localStorage.setItem("user", payload.username);
          localStorage.removeItem('pending_oauth_user');
          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
          }
          window.location.href = "/";
        } else {
          playSound('error');
          alert("Invalid 2FA code: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        playSound('error');
        alert("OAuth 2FA Login failed");
      }
      return;
    }

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
      const payload = { username, password };
      if (otpMode) {
        if (!otp.trim()) {
           playSound('error');
           alert("Please enter the 2FA code.");
           return;
        }
        payload.otp = otp;
      }

      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.requires_2fa) {
        playSound('success');
        setOtpMode(true);
        return;
      }

      if (data.message && !data.error) {
        playSound('success');
        localStorage.setItem("user", data.username || username);
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
      provider: "google",
      options: {
        queryParams: {
          prompt: 'select_account'
        }
      }
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
          {!otpMode ? (
            <>
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
            </>
          ) : (
            <>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Two-Factor Authentication is enabled. Please enter your 6-digit code.</p>
              <input
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
              />
            </>
          )}

          <button className="btn-primary" onClick={login} style={{ width: '100%', marginTop: '8px' }}>
            {otpMode ? "Verify Code" : "Sign In"}
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
              Reset Password
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
