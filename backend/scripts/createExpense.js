// FOR TESTING ONLY

import mongoose from "mongoose";
import dotenv from "dotenv";
import Expense from "../models/Expense.js"; // <-- make sure the path is correct

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

const createExpense = async () => {
  try {
    const title = "Aircon Repair";
    const description = "Replaced compressor in Unit 3B";
    const category = "Maintenance";
    const amount = 3200;
    const status = "Pending";
    const maintenanceType = "HVAC";

    // ✅ Optional: prevent duplicate expenses with same title + description
    const existing = await Expense.findOne({ title, description });
    if (existing) {
      console.log(`Expense "${title}" already exists.`);
      process.exit(0);
    }

    const expense = new Expense({
      title,
      description,
      category,
      amount,
      status,
      maintenanceType,
    });

    await expense.save();
    console.log("✅ Expense created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating expense:", err);
    process.exit(1);
  }
};

createExpense();
