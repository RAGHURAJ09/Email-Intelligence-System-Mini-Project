const API = "http://127.0.0.1:5000/api";

export async function analyzeEmail(email, user) {
  const token = localStorage.getItem('access_token');
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}/analyze`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ email, user })
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

export default API;