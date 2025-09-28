import mongoose from "mongoose";

const tenantsSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true,
    },
    lastName: { 
        type: String, 
        required: true 
    },
    email:{
        type: String,
        required: true,
        unique:true,
        lowercase: true,
    },
    contactNumber:{
        type: String,
        required:true
    },
    rentalNo:{ //1
        type: Number,
        required:true
    },
    rentalUnit:{ //A
        type:String,
        required:true
    },
    rentalAmount:{ //updatable? inital ammount
        type:Number,
        required:true
    },
    location:{
        type:String,
        required:true
    }
},{ timestamps:true });

export default mongoose.model("Tenants", tenantsSchema);
