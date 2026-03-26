const API = "http://127.0.0.1:5000/api";

export async function analyzeEmail(email) {
  const token = localStorage.getItem('access_token');
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}/analyze`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ email })  // user now extracted server-side from JWT
  });
  return res.json();
}

export async function fetchHistory(user) {
  const token = localStorage.getItem('access_token');
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}/history/${user}`, {
    headers: headers
  });
  return res.json();
}

export async function fetchAdminHistory() {
  const token = localStorage.getItem('access_token');
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}/admin/history`, {
    headers: headers
  });
  return res.json();
}

export async function fetchUserDetails(user) {
  const token = localStorage.getItem('access_token');
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API}/user/details/${encodeURIComponent(user)}`, { headers });
  return res.json();
}

export async function updateUserDetails(user, data) {
  const token = localStorage.getItem('access_token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}/user/details/${encodeURIComponent(user)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function changePassword(currentPassword, newPassword) {
  const token = localStorage.getItem('access_token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}/user/password`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
  });
  return res.json();
}

// ── Feedback (JWT required) ──
export async function submitFeedback(recordId, feedback) {
  const token = localStorage.getItem('access_token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}/feedback`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: recordId, feedback })
  });
  return res.json();
}

// ── Feedback Correction (JWT required) ──
export async function submitCorrection(recordId, correctionData) {
  const token = localStorage.getItem('access_token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}/feedback/correct`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: recordId, ...correctionData })
  });
  return res.json();
}

// ── CSV Export (JWT required) ──
export async function exportCSV(user) {
  const token = localStorage.getItem('access_token');
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}/export/${encodeURIComponent(user)}`, { headers });
  return res; // Returns raw response (streaming CSV)
}

export default API;