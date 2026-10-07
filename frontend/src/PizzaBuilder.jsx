import { useEffect, useState } from "react";
import { getPizzaOptions, createPayment, verifyPayment } from "./api";
import PizzaPlate from "./PizzaPlate";

const STEPS = ["base", "sauce", "cheese", "topping"];
const STEP_LABELS = { base: "1. Base", sauce: "2. Sauce", cheese: "3. Cheese", topping: "4. Toppings" };

export default function PizzaBuilder({ onOrderPlaced }) {
  const [options, setOptions] = useState({ base: [], sauce: [], cheese: [], topping: [] });
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, toppings: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getPizzaOptions().then(setOptions);
  }, []);

  const step = STEPS[stepIndex];

  function selectOption(option) {
    if (step === "topping") {
      setSelection((s) => {
        const exists = s.toppings.find((t) => t.name === option.name);
        return {
          ...s,
          toppings: exists ? s.toppings.filter((t) => t.name !== option.name) : [...s.toppings, option],
        };
      });
    } else {
      setSelection((s) => ({ ...s, [step]: option }));
    }
  }

  function isSelected(option) {
    if (step === "topping") return selection.toppings.some((t) => t.name === option.name);
    return selection[step]?.name === option.name;
  }

  const totalETB =
    (selection.base?.priceETB || 0) +
    (selection.sauce?.priceETB || 0) +
    (selection.cheese?.priceETB || 0) +
    selection.toppings.reduce((sum, t) => sum + t.priceETB, 0);

  async function handlePlaceOrder() {
    setMessage("Creating payment...");
    try {
      const items = [
        {
          base: selection.base.name,
          sauce: selection.sauce.name,
          cheese: selection.cheese.name,
          toppings: selection.toppings.map((t) => t.name),
          quantity: 1,
        },
      ];
      const { orderId, razorpayOrder, keyId } = await createPayment(items);

      // Razorpay Checkout — loaded via CDN script in index.html.
      const rzp = new window.Razorpay({
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "Pizza Delivery App (Test Mode)",
        handler: async (response) => {
          const result = await verifyPayment({ orderId, ...response });
          setMessage(`Order placed! Status: ${result.status}`);
          onOrderPlaced(orderId);
        },
        theme: { color: "#d84c33" },
      });
      rzp.open();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <div className="step-nav">
        {STEPS.map((s, i) => (
          <div key={s} className={i === stepIndex ? "active" : i < stepIndex ? "done" : ""}>
            {STEP_LABELS[s]}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        <PizzaPlate base={selection.base} sauce={selection.sauce} cheese={selection.cheese} toppings={selection.toppings} />

        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="option-grid">
            {options[step]?.map((opt) => (
              <div key={opt.name} className={`option-card ${isSelected(opt) ? "selected" : ""}`} onClick={() => selectOption(opt)}>
                <div>{opt.name}</div>
                <div className="price">ETB {opt.priceETB}</div>
                {opt.stockQuantity < 10 && <div style={{ fontSize: 10, color: "#ff9090" }}>Low stock</div>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            {stepIndex > 0 && <button className="secondary" onClick={() => setStepIndex((i) => i - 1)}>Back</button>}
            {stepIndex < STEPS.length - 1 && (
              <button className="primary" onClick={() => setStepIndex((i) => i + 1)} disabled={!selection[step] && step !== "topping"}>
                Next
              </button>
            )}
            {stepIndex === STEPS.length - 1 && (
              <button className="primary" onClick={handlePlaceOrder} disabled={!selection.base || !selection.sauce || !selection.cheese}>
                Pay ETB {totalETB} & Order
              </button>
            )}
          </div>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
