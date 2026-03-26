import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Documentation from "./pages/Documentation";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Account from "./pages/Account";
import History from "./pages/History";
import Hero from "./components/Hero";
import NeuralBackground from "./components/NeuralBackground";
import { BackgroundProvider } from "./context/BackgroundContext";


import { supabase } from "./utils/supabase";

export default function App() {
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const email = session.user.email;
        // Check if user has 2FA enabled or if we just need to get a JWT
        try {
          // If we already have a token and it's for this user, skip
          const currentToken = localStorage.getItem('access_token');
          const currentUser = localStorage.getItem('user');
          if (currentToken && currentUser === email) return;

          const res = await fetch(`http://127.0.0.1:5000/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, is_oauth: true })
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.requires_2fa) {
              // Intercept the login! Hold the session.
              localStorage.setItem('pending_oauth_user', email);
              // Force local logout to prevent bypassing 2FA until verified by Flask
              await supabase.auth.signOut();
              window.location.href = '/login?oauth_2fa=true';
              return;
            } else if (data.access_token) {
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('user', email);
              // Optional: reload if needed to update UI context
              // window.location.reload(); 
            }
          }
        } catch (e) {
          console.error("Failed to sync session with backend during OAuth", e);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BackgroundProvider>
      <BrowserRouter>
        <NeuralBackground />
        <Navbar />
        <div className="fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/account" element={<Account />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </BrowserRouter>
    </BackgroundProvider>
  );
}
