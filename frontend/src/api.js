const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5003/api";

function authHeaders() {
  const token = localStorage.getItem("pizza_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function getPizzaOptions() {
  const res = await fetch(`${API_URL}/pizza-options`);
  return res.json();
}

export async function createPayment(items) {
  const res = await fetch(`${API_URL}/orders/create-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function verifyPayment(payload) {
  const res = await fetch(`${API_URL}/orders/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

export async function trackOrder(orderId) {
  const res = await fetch(`${API_URL}/orders/${orderId}/track`, { headers: authHeaders() });
  return res.json();
}

export async function getMyOrders() {
  const res = await fetch(`${API_URL}/orders/mine`, { headers: authHeaders() });
  return res.json();
}
