import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import PizzaOption from "./models/Pizza.js";
import Order from "./models/Order.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  await Promise.all([User.deleteMany({}), PizzaOption.deleteMany({}), Order.deleteMany({})]);

  const adminHash = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "Admin",
    email: "admin@pizzaapp.local",
    passwordHash: adminHash,
    role: "admin",
    isEmailVerified: true,
  });

  const customerHash = await bcrypt.hash("customer123", 10);
  await User.create({
    name: "Natnael Girma",
    email: "customer@pizzaapp.local",
    passwordHash: customerHash,
    role: "customer",
    isEmailVerified: true,
    phone: "0933445566",
    address: "Bahir Dar",
  });

  await PizzaOption.insertMany([
    { step: "base", name: "Thin Crust", priceETB: 120, colorHex: "#e8c589" },
    { step: "base", name: "Deep Dish", priceETB: 150, colorHex: "#d4a860" },
    { step: "sauce", name: "Tomato", priceETB: 20, colorHex: "#c0392b" },
    { step: "sauce", name: "BBQ", priceETB: 25, colorHex: "#7b3f00" },
    { step: "cheese", name: "Mozzarella", priceETB: 40, colorHex: "#f7f0d0" },
    { step: "cheese", name: "Cheddar Blend", priceETB: 45, colorHex: "#f0c419" },
    { step: "topping", name: "Pepperoni", priceETB: 35, stockQuantity: 8, colorHex: "#8b1a1a" },
    { step: "topping", name: "Mushroom", priceETB: 25, colorHex: "#a58e6f" },
    { step: "topping", name: "Bell Pepper", priceETB: 20, colorHex: "#2e8b3d" },
    { step: "topping", name: "Onion", priceETB: 15, colorHex: "#dcd0ff" },
  ]);

  console.log("Seed complete.");
  console.log("Logins: admin@pizzaapp.local / admin123, customer@pizzaapp.local / customer123");
  console.log("Note: 'Pepperoni' seeded with low stock (8) to demonstrate the low-stock alert job.");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
