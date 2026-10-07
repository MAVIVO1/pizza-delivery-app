import cron from "node-cron";
import PizzaOption from "./models/Pizza.js";

// Runs every hour, logs (and in production would email/notify) any
// pizza ingredient whose stock has fallen below the configured threshold.
export function startLowStockAlerts() {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 10);

  cron.schedule("0 * * * *", async () => {
    try {
      const lowStock = await PizzaOption.find({ stockQuantity: { $lt: threshold } });
      if (lowStock.length > 0) {
        console.log(`[low-stock-alert] ${lowStock.length} ingredient(s) below ${threshold} units:`);
        lowStock.forEach((item) => console.log(`  - ${item.name} (${item.stockQuantity} left)`));
      }
    } catch (err) {
      console.error("[low-stock-alert] failed:", err.message);
    }
  });

  console.log("Low-stock alert cron job scheduled (hourly).");
}
