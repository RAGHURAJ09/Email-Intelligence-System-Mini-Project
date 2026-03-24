import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { fetchUserDetails } from "../api";

export default function Navbar() {
  const user = localStorage.getItem("user");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme-preference') || 'system');

  const logout = () => {
    supabase.auth.signOut().catch(e => console.warn("Supabase signout failed", e));
    
    // Hard loop to aggressively clear any Supabase session keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });

    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("pending_oauth_user");
    window.location.href = "/";
  };

  useEffect(() => {
    if (user) {
      fetchUserDetails(user).then(data => {
        if (data && !data.error && data.profile_pic) {
          setProfilePic(data.profile_pic);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    const applyTheme = () => {
      if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', themeMode);
      }
      localStorage.setItem('theme-preference', themeMode);
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => { if (themeMode === 'system') applyTheme(); };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  const cycleTheme = () => {
    if (themeMode === 'dark') setThemeMode('light');
    else if (themeMode === 'light') setThemeMode('system');
    else setThemeMode('dark');
  };

  const getThemeIcon = () => {
    if (themeMode === 'dark') return '🌙'; 
    if (themeMode === 'light') return '☀️'; 
    return '💻'; 
  };

  return (
    <nav className="nav" style={{ position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      <a href="/" style={{ textDecoration: 'none' }} title="Go to Homepage">
        <h2 className="title-gradient" style={{ margin: 0, fontSize: '24px', fontWeight: '800', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif" }}>
          EmailAI
        </h2>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Theme Toggle Button */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${themeMode}`}
          style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255, 255, 255, 0.15)', color: 'var(--text-main)', 
            fontSize: '18px', cursor: 'pointer', borderRadius: '50%', width: '40px', height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
          }}
        >
          {getThemeIcon()}
        </button>

        {!user && (
          <a href="/signup" className="btn-primary" style={{ color: 'white', fontFamily: "'Inter', sans-serif", fontWeight: '600', padding: '8px 24px', margin: 0, borderRadius: '99px' }}>Get Started</a>
        )}

        {/* User Profile Circular Avatar Menu */}
        {user && (
          <div style={{ position: 'relative' }}>
             <button 
               onClick={() => { setAccountMenuOpen(!accountMenuOpen); setMenuOpen(false); }} 
               style={{ 
                 width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', padding: 0, 
                 border: '1px solid rgba(255, 255, 255, 0.25)', cursor: 'pointer', background: 'var(--bg-card)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none',
                 boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
               }}>
                 {profilePic ? (
                    <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                    <div style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                      {user.charAt(0).toUpperCase()}
                    </div>
                 )}
             </button>

             {/* Account Dropdown */}
             {accountMenuOpen && (
                <div style={{ 
                  position: 'absolute', top: '100%', right: '0', marginTop: '12px', 
                  background: 'rgba(15, 15, 25, 0.95)', // Solid dark for contrast in light mode
                  backdropFilter: 'blur(28px)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', 
                  padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', 
                  minWidth: '220px', zIndex: 100, boxShadow: 'var(--glass-shadow)'
                }}>
                  <div style={{ padding: '8px 14px', fontSize: '13px', color: '#f8fafc', opacity: 0.9, fontWeight: '500', marginBottom: '4px', wordBreak: 'break-all' }}>
                    Signed in as<br/><strong style={{color: '#8b5cf6', letterSpacing: '0.5px'}}>{user}</strong>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                  <DropdownLink href="/account">My Account</DropdownLink>
                  <DropdownButton onClick={logout} style={{ color: '#fb7185' }}>Logout</DropdownButton>
                </div>
             )}
          </div>
        )}

        {/* Hamburger Menu Button */}
        <div style={{ position: 'relative' }}>
          <button 
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '28px', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
              transition: 'transform 0.3s ease',
              transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)'
            }}
            onClick={() => { setMenuOpen(!menuOpen); setAccountMenuOpen(false); }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Three-line Dropdown Menu */}
          {menuOpen && (
            <div style={{ 
              position: 'absolute', top: '100%', right: '0', marginTop: '12px', 
              background: 'rgba(15, 15, 25, 0.95)', // Force solid dark
              backdropFilter: 'blur(25px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', 
              padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', 
              minWidth: '200px', zIndex: 100, boxShadow: 'var(--glass-shadow)'
            }}>
              
              <DropdownLink href="/">Home</DropdownLink>
              <DropdownLink href="/about">Team</DropdownLink>
              <DropdownLink href="/dashboard">Dashboard</DropdownLink>
              
              {!user && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
                  <DropdownLink 
                    href="/login" 
                    style={{ 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      border: '1px solid rgba(99, 102, 241, 0.3)', 
                      color: '#818cf8', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      marginTop: '4px'
                    }}
                  >
                    Login
                  </DropdownLink>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const dropdownLinkStyle = {
  display: 'block', 
  background: 'transparent', 
  border: 'none', 
  color: 'var(--text-main)', 
  textAlign: 'left', 
  padding: '10px 14px', 
  cursor: 'pointer', 
  borderRadius: '8px', 
  textDecoration: 'none', 
  fontFamily: "'Inter', sans-serif", 
  fontSize: '15px', 
  fontWeight: '500', 
  margin: 0,
  transition: 'background 0.2s'
};

function DropdownLink({ href, onClick, children, style = {} }) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      style={{ ...dropdownLinkStyle, ...style }}
      onMouseEnter={(e) => {
        if (!style.background) e.target.style.background = 'rgba(128,128,128,0.1)'
      }}
      onMouseLeave={(e) => {
        if (!style.background) e.target.style.background = 'transparent'
      }}
    >
      {children}
    </a>
  );
}

function DropdownButton({ onClick, children, style = {} }) {
  return (
    <button 
      onClick={onClick}
      style={{ ...dropdownLinkStyle, ...style }}
      onMouseEnter={(e) => {
        if (!style.background) e.target.style.background = 'rgba(128,128,128,0.1)'
      }}
      onMouseLeave={(e) => {
        if (!style.background) e.target.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  );
}
