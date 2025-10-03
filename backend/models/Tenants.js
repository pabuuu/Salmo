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
  },
  { timestamps: true }
);

export default mongoose.model("Tenants", TenantsSchema);
