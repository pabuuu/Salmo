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
      required: true,
      default: "",
    },
    contactNumber: {
      type: String,
      required: true,
      default: "",
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Units",
      required: true,
    },
    initialPayment: {
      type: Number,
      required: true,
    },
    paymentFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    nextDueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Paid", "Partial", "Overdue", "Unpaid", "Pending"],
      default: "Unpaid",
    },
    receiptUrl: {
      type: String,
      required: false, 
    },
    lastDueDate: {
      type: Date,
    },
    password:{
      type:String,
      required:false,
      default:null
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    resetToken: { 
      type: String 
    },
    resetTokenExpires: { 
      type: Date 
    },
    contractStart:{
      type:Date,
      required:false,
    },
    contractEnd:{
      type:Date,
      required:false
    },
    contractURL:{
      type: String,
      required: false,
    },
    validID: {
      type: String, 
      required: false,
    },
    cashbond: {
      type: Number,
      default: 0,
    },    
  },
  { timestamps: true }
);

export default mongoose.model("Tenants", TenantsSchema);
