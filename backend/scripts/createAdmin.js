//THIS IS FOR TESTING ONLYYY BRO
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

const createAdmin = async () => {
  try {
    const username = "admin";
    const password = "admin123"; 
    const role = "admin";

    //check if exists
    const existing = await User.findOne({ username });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //create
    const admin = new User({
      username,
      password: hashedPassword,
      role,
    });

    await admin.save();
    console.log("Admin account created successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
