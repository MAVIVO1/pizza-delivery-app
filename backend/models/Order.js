import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    base: String,
    sauce: String,
    cheese: String,
    toppings: [String],
    priceETB: Number,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalETB: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "preparing", "baking", "out-for-delivery", "delivered", "cancelled"],
      default: "placed",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
