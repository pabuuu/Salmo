import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Paid"], // Removed Under Maintenance
      default: "Pending",
    },
    maintenanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Maintenance",
      default: null,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      default: null,
    },
    receiptImage: {
      type: String, // store filename or URL
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
