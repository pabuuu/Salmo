import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenants", // links to the tenant
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units", // links to the rented unit
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "GCash", "Bank Transfer", "Other","Initial Payment"],
      default: "Cash",
    },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Pending", "Overdue"], // add Partial
      default: "Pending",
    },
    notes: {
      type: String,
    },
    receiptUrl:{
      type:String,
      default: null,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
