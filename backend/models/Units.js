import mongoose from "mongoose";

const unitsSchema = new mongoose.Schema({
  unitNo: {            // e.g., "A-101"
    type: String,
    required: true,
    unique: true
  },
  type: {              // e.g., "Studio", "1BR"
    type: String,
    required: true
  },
  rentAmount: {        // default rent price
    type: Number,
    required: true
  },
  status: {            // Available / Occupied / Under Maintenance
    type: String,
    enum: ["Available", "Occupied", "Maintenance"],
    default: "Available"
  },
  location: {          // Building name / Address
    type: String,
    required: true
  },
  notes: {             // Optional remarks
    type: String
  }
}, { timestamps: true });

export default mongoose.model("Units", unitsSchema);
