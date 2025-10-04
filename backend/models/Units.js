import mongoose from "mongoose";

const unitsSchema = new mongoose.Schema({
  unitNo: { type: String, required: true },
  rentAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Available", "Occupied", "Maintenance"],
    default: "Available"
  },
  location: {
    type: String,
    required: true,
    enum: [
      "Kambal Road GB",
      "MH Del Pilar",
      "Easterview",
      "GSIS",
      "Bulet",
      "Liamson"
    ]
  },
  notes: { type: String },

  // ✅ Reference tenant
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenants", default: null }
}, { timestamps: true });

unitsSchema.index({ location: 1, unitNo: 1 }, { unique: true });

export default mongoose.model("Units", unitsSchema);
