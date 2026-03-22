export async function registerUser(userId: string, firstName: string) {
  const res = await fetch("/api/users", {
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
  const res = await fetch("/api/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, mood, energy, sleep, note, provider }),
  });
  const data = await res.json();
  console.log("API /api/checkin response:", JSON.stringify(data).substring(0, 200));
  return data;
}

export async function getInsights(userId: string, provider: string = "ramalama") {
  const res = await fetch(`/api/insights/${userId}?provider=${provider}`);
  return res.json();
}

export async function getHistory(userId: string) {
  const res = await fetch(`/api/history/${userId}`);
  return res.json();
}

export async function compareCheckin(
  userId: string,
  mood: number,
  energy: number,
  sleep: number,
  note?: string
) {
  const res = await fetch("/api/checkin/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, mood, energy, sleep, note }),
  });
  const data = await res.json();
  console.log("API /api/checkin/compare response:", JSON.stringify(data).substring(0, 300));
  return data;
}

export async function getDashboard() {
  const res = await fetch("/api/dashboard");
  return res.json();
}

export async function seedDemo() {
  const res = await fetch("/api/seed-demo", { method: "POST" });
  return res.json();
}

export async function getDepartments() {
  const res = await fetch("/api/dashboard/departments");
  return res.json();
}
