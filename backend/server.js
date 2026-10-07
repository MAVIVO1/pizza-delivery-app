import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import pizzaOptionRoutes from "./routes/pizzaOptions.js";
import orderRoutes from "./routes/orders.js";
import { startLowStockAlerts } from "./cronJobs.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/pizza-options", pizzaOptionRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5003;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    startLowStockAlerts();
    app.listen(PORT, () => console.log(`Pizza Delivery API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

export default app;
