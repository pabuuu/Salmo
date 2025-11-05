// THIS IS FOR TESTING ONLY
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // adjust if your model filename differs

// Load .env from parent folder
dotenv.config({ path: "../.env" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const createSuperAdmin = async () => {
  try {
    const username = "superadmin";
    const password = "superadmin123";
    const role = "superadmin";

    // Check if already exists
    const existing = await User.findOne({ username });
    if (existing) {
      console.log("⚠️ Super Admin already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new Super Admin
    const superAdmin = new User({
      username,
      password: hashedPassword,
      role,
    });

    await superAdmin.save();
    console.log("✅ Super Admin account created successfully");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err);
    process.exit(1);
  }
};

createSuperAdmin();
