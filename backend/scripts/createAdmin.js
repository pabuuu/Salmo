import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({ path: "../.env" });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const createSuperAdmin = async () => {
  try {
    const fullName = "Super Administrator";
    const username = "superadmin";
    const email = "superadmin@rangeles.online";
    const password = "superadmin123";
    const contactNumber = "00000000000";
    const role = "superadmin";

    // Check if superadmin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Super Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
      contactNumber,
      isVerified: true,
      isTemporaryPassword: false,
      role,
    });

    await superAdmin.save();

    console.log("✅ Super Admin account created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err);
    process.exit(1);
  }
};

createSuperAdmin();
