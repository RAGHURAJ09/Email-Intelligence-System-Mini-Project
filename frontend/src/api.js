const API = "http://127.0.0.1:5000/api";

export async function analyzeEmail(email, user) {
  const res = await fetch(`${API}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, user })
  });
  return res.json();
}

export async function fetchHistory(user) {
  const res = await fetch(`${API}/history/${user}`);
  return res.json();
}

export default API;