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
    profile_pic: ""
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
          profile_pic: data.profile_pic || ""
        });
      } else {
        // If 404, we just initialize blank details
        setDetails({
          username: userIdentifier || "",
          email: userIdentifier || "",
          fullname: "",
          bio: "",
          profile_pic: ""
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

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
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
          </div>
          
          <div style={{ padding: '20px 30px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}>
             <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.5)' }} onClick={logout}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
