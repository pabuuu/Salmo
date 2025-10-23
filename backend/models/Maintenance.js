import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenants", required: false },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Units", required: true },
    task: { type: [String], required: true },    
    description: { type: String, required: false },
    schedule: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Process", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium", // Default level
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
