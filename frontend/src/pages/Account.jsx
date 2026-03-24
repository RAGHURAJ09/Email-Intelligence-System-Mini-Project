import React, { useState, useEffect } from "react";
import { fetchUserDetails, updateUserDetails, changePassword } from "../api";
import { supabase } from "../utils/supabase";
import Cropper from 'react-easy-crop';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )
  return canvas.toDataURL('image/jpeg', 0.9)
}

export default function Account() {
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'password'
  
  const [details, setDetails] = useState({
    username: "",
    email: "",
    fullname: "",
    bio: "",
    profile_pic: "",
    two_factor_enabled: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showFullImage, setShowFullImage] = useState(false);

  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    loadDetails();
    setMessage("");
    setError("");
  }, []);

  const loadDetails = async () => {
    try {
      const userIdentifier = localStorage.getItem("user");
      if (!userIdentifier) return;
      const data = await fetchUserDetails(userIdentifier);
      if (!data.error) {
        setDetails({
          username: data.username || "",
          email: data.email || "",
          fullname: data.fullname || "",
          bio: data.bio || "",
          profile_pic: data.profile_pic || "",
          two_factor_enabled: data.two_factor_enabled || false
        });
      } else {
        // If 404, we just initialize blank details
        setDetails({
          username: userIdentifier || "",
          email: userIdentifier || "",
          fullname: "",
          bio: "",
          profile_pic: "",
          two_factor_enabled: false
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetailsChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input to allow opening same file again
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setDetails({ ...details, profile_pic: croppedImage });
      setImageSrc(null); // Cleanup and close
    } catch (e) {
      console.error(e);
    }
  };

  const saveDetails = async () => {
    const userIdentifier = localStorage.getItem("user");
    if (!userIdentifier) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      const data = await updateUserDetails(userIdentifier, {
        fullname: details.fullname,
        bio: details.bio,
        profile_pic: details.profile_pic
      });
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("Account details updated successfully.");
      }
    } catch (err) {
      setError("Failed to update details.");
    }
    setLoading(false);
  };

  const changePwd = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Please fill all password fields.");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const data = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("Password changed successfully.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setError("Failed to change password.");
    }
    setLoading(false);
  };

  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [otpVerify, setOtpVerify] = useState("");

  const setup2FA = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:5000/api/2fa/setup/${encodeURIComponent(localStorage.getItem("user"))}`, {
        method: "GET"
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qr_code);
        setTwoFactorSecret(data.secret);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!otpVerify) {
      setError("Please enter the 6-digit code.");
      return;
    }
    try {
       setLoading(true);
       const res = await fetch("http://127.0.0.1:5000/api/2fa/verify", {
         method: "POST",
         headers: { 
           "Content-Type": "application/json"
         },
         body: JSON.stringify({ otp: otpVerify, username: localStorage.getItem("user") })
       });
      const data = await res.json();
      if (res.ok) {
        setMessage("Two-Factor Authentication successfully enabled!");
        setQrCode("");
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    try {
       setLoading(true);
       const res = await fetch("http://127.0.0.1:5000/api/2fa/disable", {
         method: "POST",
         headers: { 
           "Content-Type": "application/json"
         },
         body: JSON.stringify({ username: localStorage.getItem("user") })
       });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setDetails(prev => ({ ...prev, two_factor_enabled: false }));
        setQrCode("");
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="center">
      {/* Profile Pic Crop Modal */}
      {imageSrc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '600px', height: '60vh', background: '#222', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
            <button className="btn-secondary" onClick={() => setImageSrc(null)}>Cancel</button>
            <button className="btn-primary" onClick={showCroppedImage}>Apply Crop</button>
          </div>
        </div>
      )}

      <div className="analyzer-container" style={{ marginTop: '40px', maxWidth: '600px' }}>
        <button 
          onClick={() => window.history.back()} 
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '20px', fontSize: '14px', transition: 'color 0.3s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--text-main)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          ← Back
        </button>
        <h2 className="analyzer-heading">My Account</h2>

        <div className="account-card" style={{ 
          background: 'rgba(15, 15, 25, 0.65)', 
          backdropFilter: 'blur(25px)', 
          border: '1px solid rgba(255, 255, 255, 0.15)', 
          borderRadius: '24px', 
          overflow: 'hidden'
        }}>
          <div className="account-tabs">
            <button className={activeTab === 'details' ? 'active' : ''} onClick={() => { setActiveTab('details'); setMessage(""); setError("");}}>Details</button>
            <button className={activeTab === 'password' ? 'active' : ''} onClick={() => { setActiveTab('password'); setMessage(""); setError("");}}>Password</button>
            <button className={activeTab === 'security' ? 'active' : ''} onClick={() => { setActiveTab('security'); setMessage(""); setError("");}}>Security</button>
          </div>

          <div style={{ padding: '30px' }}>
            {message && <div className="alert success">{message}</div>}
            {error && <div className="alert error">{error}</div>}

            {activeTab === 'details' && (
              <div className="account-form">
                <div className="profile-pic-section">
                  <div className="profile-pic-preview" title="Click to enlarge" onClick={() => details.profile_pic && setShowFullImage(true)}>
                    {details.profile_pic ? (
                      <img src={details.profile_pic} alt="Profile" />
                    ) : (
                      <div className="placeholder-pic">{details.username?.charAt(0)?.toUpperCase() || "U"}</div>
                    )}
                  </div>
                  <label className="btn-secondary pic-upload-btn" style={{ cursor: 'pointer' }}>
                    Upload Picture
                    <input type="file" accept="image/*" onChange={handlePicUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {showFullImage && details.profile_pic && (
                  <div className="image-zoom-overlay" onClick={() => setShowFullImage(false)}>
                    <img src={details.profile_pic} alt="Full Profile" onClick={e => e.stopPropagation()} />
                    <button 
                      onClick={() => setShowFullImage(false)} 
                      style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer', outline: 'none' }}
                    >×</button>
                  </div>
                )}

                <div className="form-group">
                  <label>Username (Read-only)</label>
                  <input type="text" value={details.username} disabled />
                </div>

                <div className="form-group">
                  <label>Email (Read-only)</label>
                  <input type="email" value={details.email} disabled />
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullname" value={details.fullname} onChange={handleDetailsChange} placeholder="Enter your full name" />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea name="bio" value={details.bio} onChange={handleDetailsChange} placeholder="Tell us about yourself" rows="4"></textarea>
                </div>

                <button className="btn-primary" onClick={saveDetails} disabled={loading} style={{ marginTop: '10px' }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="account-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} placeholder="Enter your current password" />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="Enter a new password" />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm your new password" />
                </div>

                <button className="btn-primary" onClick={changePwd} disabled={loading} style={{ marginTop: '10px' }}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}
            {activeTab === 'security' && (
              <div className="account-form">
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Two-Factor Authentication (2FA) adds an extra layer of security to your account.</p>
                
                {details.two_factor_enabled ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <p style={{ color: '#10b981', fontWeight: 'bold', margin: '0 0 12px 0' }}>✅ 2FA is Currently Enabled</p>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>Your account is protected. You will be asked for a verification code when signing in with your username and password.</p>
                    <button className="btn-secondary" onClick={disable2FA} disabled={loading} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', width: 'fit-content' }}>
                      {loading ? "Disabling..." : "Disable 2FA"}
                    </button>
                  </div>
                ) : !qrCode ? (
                  <button className="btn-primary" onClick={setup2FA} disabled={loading} style={{ width: 'fit-content', marginTop: '10px' }}>
                    {loading ? "Setting up..." : "Enable 2FA"}
                  </button>
                ) : (
                  <div style={{ marginTop: '16px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#e2e8f0', fontWeight: 'bold' }}>Scan this QR Code</p>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>Use an authenticator app like Google Authenticator or Authy to scan the QR code below.</p>
                    
                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
                      <img src={qrCode} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
                    </div>

                    <div className="form-group">
                      <label>Secret Key (Manual Entry)</label>
                      <input type="text" value={twoFactorSecret} disabled style={{ fontFamily: 'monospace', letterSpacing: '2px', textAlign: 'center' }} />
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label>Verification Code</label>
                      <input 
                        type="text" 
                        value={otpVerify} 
                        onChange={e => setOtpVerify(e.target.value)} 
                        placeholder="Enter the 6-digit code" 
                        maxLength={6}
                        style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '18px' }}
                      />
                    </div>

                    <button className="btn-primary" onClick={verify2FA} disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                      {loading ? "Verifying..." : "Verify & Enable"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ padding: '20px 30px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}>
             <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.5)' }} onClick={logout}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
