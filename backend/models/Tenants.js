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
      default: "",
    },
    contactNumber: {
      type: String,
      default: "",
    },
    // Unit reference
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      required: true,
    },
    initialPayment:{
      type:Number,
      required:true,
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
      required: false,
    },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Overdue","Unpaid"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tenants", TenantsSchema);
