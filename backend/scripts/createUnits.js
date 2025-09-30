//FOR TESTING ONLY

import mongoose from "mongoose";
import dotenv from "dotenv";
import Units from "../models/Units.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

const createUnit = async () => {
  try {
    const unitNo = "A-101";
    const type = "Studio";
    const rentAmount = 15000;
    const location = "Building A";
    const status = "Available";

    const existing = await Units.findOne({ unitNo });
    if (existing) {
      console.log("Unit already exists");
      process.exit(0);
    }

    const unit = new Units({ unitNo, type, rentAmount, location, status });
    await unit.save();
    console.log("Unit created successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createUnit();
