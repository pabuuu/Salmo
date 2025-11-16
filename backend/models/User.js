import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "staff", "superadmin"],
      default: "admin",
    },
    contactNumber: { type: String, required: true },

    validId: { type: String },
    resume: { type: String },
    isVerified: { type: Boolean, default: false },

    // 🔹 For temporary password logic
    isTemporaryPassword: { type: Boolean, default: true },

    // 🔹 For password reset logic
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
