import { useState } from "react";
import { login } from "./api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("customer@pizzaapp.local");
  const [password, setPassword] = useState("customer123");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("pizza_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: "80px auto" }}>
      <h2 style={{ color: "#f0c419" }}>🍕 Pizza Delivery App</h2>
      {error && <p style={{ color: "#ff9090" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button className="primary" type="submit">Sign In</button>
      </form>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 14 }}>
        Customer: customer@pizzaapp.local / customer123<br />
        Admin: admin@pizzaapp.local / admin123
      </p>
    </div>
  );
}
