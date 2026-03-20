const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function registerUser(userId: string, firstName: string) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, first_name: firstName }),
  });
  return res.json();
}

export async function submitCheckin(
  userId: string,
  mood: number,
  energy: number,
  sleep: number,
  provider: string = "ramalama",
  note?: string
) {
  const res = await fetch(`${API_BASE}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, mood, energy, sleep, note, provider }),
  });
  return res.json();
}

export async function getInsights(userId: string, provider: string = "ramalama") {
  const res = await fetch(`${API_BASE}/api/insights/${userId}?provider=${provider}`);
  return res.json();
}

export async function getHistory(userId: string) {
  const res = await fetch(`${API_BASE}/api/history/${userId}`);
  return res.json();
}
