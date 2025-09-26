const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true } 
);

// // Optional: Index for faster queries
// userSchema.index({ email: 1 });

// Hide sensitive fields when sending JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

const Admin = mongoose.model("User", adminSchema);

module.exports = User;
