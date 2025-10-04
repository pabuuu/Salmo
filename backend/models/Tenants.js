import mongoose from "mongoose";

const TenantsSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "",
    },
    // Store which unit they are assigned to
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      required: false,
    },
    rentalAmount:{ //updatable? inital ammount
        type:Number,
        required:true,
        min: [1000, "Rental amount must be at least 1000"]
    },
    paymentFrequency: { 
        type: String,
        enum: ["Monthly", "Quarterly", "Yearly"],
        default: "Monthly",
        required: true
    },
    location:{
        type:String,
        required:true
    },
    isArchived: {
        type: Boolean,
        default: false
    },
},{ timestamps:true });

export default mongoose.model("Tenants", TenantsSchema);
