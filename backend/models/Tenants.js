import mongoose from "mongoose";

const tenantsSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true,
        minlength: [2, "First name must be at least 2 characters long"],
        maxlength: [50, "First name must not exceed 50 characters"],
        trim: true,
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique:true,
        lowercase: true,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    contactNumber: {
        type: String,
        required: true,
        match: [/^09\d{9}$/, "Contact number must be a valid PH number starting with 09 and 11 digits long"]
    },
    rentalUnit:{ //A
        type:String,
        required:true,
        uppercase: true
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
    }
},{ timestamps:true });

export default mongoose.model("Tenants", tenantsSchema);
