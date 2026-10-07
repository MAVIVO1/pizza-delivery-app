import express from "express";
import PizzaOption from "../models/Pizza.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public: the 4-step builder needs this without auth (browsing before login).
router.get("/", async (req, res) => {
  const options = await PizzaOption.find();
  const grouped = { base: [], sauce: [], cheese: [], topping: [] };
  options.forEach((o) => grouped[o.step].push(o));
  res.json(grouped);
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const option = await PizzaOption.create(req.body);
    res.status(201).json(option);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const option = await PizzaOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!option) return res.status(404).json({ message: "Not found" });
  res.json(option);
});

export default router;
