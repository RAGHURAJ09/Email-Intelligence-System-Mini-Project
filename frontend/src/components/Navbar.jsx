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
      <h2 style={{
        background: 'linear-gradient(to right, #60a5fa, #34d399)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.4))'
      }}>
        AI Email Intelligence
      </h2>

      <div>
        <a href="/">Home</a>
        <a href="/about">Team</a>
        <a href="/dashboard">Dashboard</a>

        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/signup">Signup</a>
          </>
        )}
      </div>
    </nav>
  );
}
