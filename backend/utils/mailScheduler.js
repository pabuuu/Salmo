import cron from "node-cron";
import { updateOverdueTenants } from "../utils/updateOverdues.js";

export const initScheduler = () => {
  console.log("✅ Scheduler initialized.");

  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running daily overdue tenant check...");
    try {
      await updateOverdueTenants();
      console.log("✅ Overdue check completed.");
    } catch (err) {
      console.error("❌ Error running overdue check:", err);
    }
  });
};
