import mongoose from "mongoose";

const qrSchema = new mongoose.Schema({
  gcash: String,
  bank: String
}, { collection: "qr" }); // <- use the actual collection name

export default mongoose.model("QR", qrSchema);
