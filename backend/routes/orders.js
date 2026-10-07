import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import PizzaOption from "../models/Pizza.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Step 1: create a Razorpay order (test mode) for the built pizza(s) in the cart.
router.post("/create-payment", async (req, res) => {
  try {
    const { items } = req.body; // [{ base, sauce, cheese, toppings, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const allOptions = await PizzaOption.find();
    const priceByName = {};
    allOptions.forEach((o) => (priceByName[o.name] = o.priceETB));

    let totalETB = 0;
    const resolvedItems = items.map((item) => {
      const price =
        (priceByName[item.base] || 0) +
        (priceByName[item.sauce] || 0) +
        (priceByName[item.cheese] || 0) +
        (item.toppings || []).reduce((sum, t) => sum + (priceByName[t] || 0), 0);
      const quantity = item.quantity || 1;
      totalETB += price * quantity;
      return { ...item, priceETB: price, quantity };
    });

    const razorpay = getRazorpayInstance();
    // Razorpay expects the smallest currency unit; ETB is treated like paisa-equivalent here for test mode.
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalETB * 100),
      currency: "ETB",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      customer: req.user.id,
      items: resolvedItems,
      totalETB,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
    });

    res.status(201).json({ orderId: order._id, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Step 2: verify the payment signature Razorpay's checkout.js returns client-side.
router.post("/verify-payment", async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "paid", razorpayPaymentId: razorpay_payment_id, status: "preparing" },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", async (req, res) => {
  res.json(await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }));
});

// Polling-based live order tracker — frontend hits this every few seconds.
router.get("/:id/track", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json({ id: order._id, status: order.status, updatedAt: order.updatedAt });
});

router.get("/", requireRole("admin"), async (req, res) => {
  res.json(await Order.find().populate("customer", "name email").sort({ createdAt: -1 }));
});

router.patch("/:id/status", requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order);
});

export default router;
