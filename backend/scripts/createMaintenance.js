import mongoose from "mongoose";
import dotenv from "dotenv";
import Maintenance from "../models/Maintenance.js";
import Tenant from "../models/Tenants.js";
import Unit from "../models/Units.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "your-mongo-uri";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

const createMaintenance = async () => {
  try {
    // Pick one random tenant
    const tenant = await Tenant.findOne();
    if (!tenant) throw new Error("No tenants found in the database");

    // Pick one random unit
    const unit = await Unit.findOne();
    if (!unit) throw new Error("No units found in the database");

    const maintenance = new Maintenance({
      tenant: tenant._id,
      unit: unit._id,
      task: "Fix Air Conditioning",
      schedule: new Date("2025-10-15T00:00:00Z"),
      status: "Pending",
    });

    await maintenance.save();
    console.log("✅ Maintenance created:", maintenance);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createMaintenance();
