import { useEffect, useState } from "react";
import { trackOrder } from "./api";

const STAGES = ["placed", "preparing", "baking", "out-for-delivery", "delivered"];

export default function OrderTracker({ orderId, onDone }) {
  const [status, setStatus] = useState("placed");

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const data = await trackOrder(orderId);
        setStatus(data.status);
      } catch {
        // order not found yet or network hiccup - polling will retry
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="card">
      <h3>Tracking Order #{orderId?.slice(-6)}</h3>
      <div className="tracker-status">
        {STAGES.map((s, i) => (
          <div key={s} className={i <= currentIndex ? "reached" : ""}>
            {s.replace(/-/g, " ")}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>
        Polling every 4s. In a real deployment, an admin updates order status from the admin panel.
      </p>
      <button className="secondary" onClick={onDone} style={{ marginTop: 10 }}>Order another pizza</button>
    </div>
  );
}
