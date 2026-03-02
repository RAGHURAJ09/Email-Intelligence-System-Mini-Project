import React from "react";
import { supabase } from "../utils/supabase";

export default function Navbar() {
  const user = localStorage.getItem("user");

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="nav">
      <h2 className="title-gradient" style={{ margin: 0, fontSize: '20px' }}>
        EmailAI
      </h2>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <a href="/">Home</a>
        <a href="/about">Team</a>
        <a href="/dashboard">Dashboard</a>

        {user ? (
          <button className="btn-secondary" style={{ marginLeft: '24px' }} onClick={logout}>Logout</button>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/signup" className="btn-primary" style={{ color: 'white' }}>Get Started</a>
          </>
        )}
      </div>
    </nav>
  );
}
