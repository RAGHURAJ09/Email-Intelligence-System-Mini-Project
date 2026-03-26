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
        // Check if user has 2FA enabled
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/user/details/${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.two_factor_enabled) {
              // Intercept the login! Hold the session.
              localStorage.setItem('pending_oauth_user', email);
              // Force local logout to prevent bypassing 2FA
              await supabase.auth.signOut();
              window.location.href = '/login?oauth_2fa=true';
              return;
            }
          }
        } catch (e) {
          console.error("Failed to check 2FA status during OAuth", e);
        }

        // Standard login bypass if 2FA disabled
        localStorage.setItem('user', email);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('user');
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
