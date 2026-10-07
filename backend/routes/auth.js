import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// In-memory verification token store (swap for Redis/DB in production).
const verificationTokens = new Map();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, phone, address });

    const verifyToken = crypto.randomBytes(24).toString("hex");
    verificationTokens.set(verifyToken, user._id.toString());

    // In production this token would be emailed to the user via a mail service.
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      message: "Registered. Verify your email to activate the account.",
      devVerifyToken: verifyToken, // exposed here only for local/dev testing
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/verify/:token", async (req, res) => {
  const userId = verificationTokens.get(req.params.token);
  if (!userId) return res.status(400).json({ message: "Invalid or expired verification token" });

  await User.findByIdAndUpdate(userId, { isEmailVerified: true });
  verificationTokens.delete(req.params.token);
  res.json({ message: "Email verified. You can now log in." });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
