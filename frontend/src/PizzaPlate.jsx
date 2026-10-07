// Renders the pizza as concentric SVG circles that fill in layer-by-layer
// as the user completes each of the 4 builder steps.
export default function PizzaPlate({ base, sauce, cheese, toppings }) {
  return (
    <svg className="pizza-plate" width="220" height="220" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="105" fill="#3a1c10" />
      <circle className="layer" cx="110" cy="110" r="95" fill={base?.colorHex || "#3a1c10"} opacity={base ? 1 : 0.15} />
      <circle className="layer" cx="110" cy="110" r="80" fill={sauce?.colorHex || "#3a1c10"} opacity={sauce ? 1 : 0.15} />
      <circle className="layer" cx="110" cy="110" r="68" fill={cheese?.colorHex || "#3a1c10"} opacity={cheese ? 0.85 : 0.1} />
      {toppings.map((t, i) => {
        const angle = (i / Math.max(toppings.length, 1)) * 2 * Math.PI;
        const radius = 35 + (i % 3) * 12;
        const cx = 110 + radius * Math.cos(angle);
        const cy = 110 + radius * Math.sin(angle);
        return <circle key={t.name + i} cx={cx} cy={cy} r="9" fill={t.colorHex} />;
      })}
    </svg>
  );
}
