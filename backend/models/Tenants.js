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
    // Store which unit they are assigned to
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      required: false,
    },
    rentAmount:{
      type: Number,
      required:true
    },
    paymentFrequency:{
      type:String,
      enum:['Monthly','Quarterly','Yearly'],
      required:true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tenants", TenantsSchema);
