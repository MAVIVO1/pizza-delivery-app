import { useState } from "react";
import Login from "./Login";
import PizzaBuilder from "./PizzaBuilder";
import OrderTracker from "./OrderTracker";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  function handleLogout() {
    localStorage.removeItem("pizza_token");
    setUser(null);
    setActiveOrderId(null);
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div>
      <header>
        <h1>🍕 Pizza Delivery App</h1>
        <div>
          <span style={{ marginRight: 14, opacity: 0.85 }}>{user.name} ({user.role})</span>
          <button className="secondary" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main>
        {activeOrderId ? (
          <OrderTracker orderId={activeOrderId} onDone={() => setActiveOrderId(null)} />
        ) : (
          <PizzaBuilder onOrderPlaced={setActiveOrderId} />
        )}
      </main>
    </div>
  );
}
