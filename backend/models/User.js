import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "staff"],
      default: "admin",
    },
    contactNumber: { type: String, required: true },

    validId: { type: String }, // Optional (store file path or URL)
    resume: { type: String },  // Optional (store file path or URL)
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
