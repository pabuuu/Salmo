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
    const unitNo = "A";
    const rentAmount = 15000;
    const location = "Liamson";
    const status = "Available";

    // ✅ Check for duplicates *within the same location*
    const existing = await Units.findOne({ unitNo, location });
    if (existing) {
      console.log(`Unit "${unitNo}" already exists in location "${location}"`);
      process.exit(0);
    }

    const unit = new Units({ unitNo, rentAmount, location, status });
    await unit.save();
    console.log("✅ Unit created successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createUnit();
