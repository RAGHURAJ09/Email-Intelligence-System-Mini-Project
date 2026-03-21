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
import Hero from "./components/Hero";
import NeuralBackground from "./components/NeuralBackground";
import { BackgroundProvider } from "./context/BackgroundContext";


import { supabase } from "./utils/supabase";

export default function App() {
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('user', session.user.email);
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
          </Routes>
        </div>
      </BrowserRouter>
    </BackgroundProvider>
  );
}
