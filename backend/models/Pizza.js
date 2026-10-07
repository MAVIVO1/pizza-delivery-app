import mongoose from "mongoose";

// Catalog for the 4-step pizza builder: base, sauce, cheese, toppings.
const pizzaOptionSchema = new mongoose.Schema(
  {
    step: { type: String, enum: ["base", "sauce", "cheese", "topping"], required: true },
    name: { type: String, required: true },
    priceETB: { type: Number, required: true },
    stockQuantity: { type: Number, default: 100 },
    colorHex: String, // used to fill the SVG plate layer-by-layer on the frontend
  },
  { timestamps: true }
);

export default mongoose.model("PizzaOption", pizzaOptionSchema);
