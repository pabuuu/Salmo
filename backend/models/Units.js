import mongoose from "mongoose";

const unitsSchema = new mongoose.Schema({
  unitNo: { 
    type: String, 
    required: true 
  },
  rentAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String,
    enum: ["Available", "Occupied", "Maintenance"],
    default: "Available"
  },
  location: { 
    type: String,
    required: true,
    enum: [               // ✅ Only these locations are valid
      "Kambal Road GB",
      "MH Del Pilar",
      "Easterview",
      "GSIS",
      "Bulet",
      "Liamson"
    ]
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

// ✅ Ensure unitNo is unique **per location**
unitsSchema.index({ location: 1, unitNo: 1 }, { unique: true });

export default mongoose.model("Units", unitsSchema);
