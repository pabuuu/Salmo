import mongoose from "mongoose";

const TenantsSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      default: "",
    },
    contactNumber: {
      type: String,
      required: true,
      default: "",
    },
    // Unit reference
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      required: true,
    },
    initialPayment: {
      type: Number,
      required: true,
    },
    paymentFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      required: true,
    },
    // Track unpaid balance
    balance: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    nextDueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Overdue", "Unpaid", "Pending"],
      default: "Unpaid",
    },
    receiptUrl: {
      type: String,
      required: true, // ✅ Receipt is now mandatory
    },
    lastDueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tenants", TenantsSchema);
