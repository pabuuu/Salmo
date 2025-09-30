//JAY DONT TOUCH OR USE 

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
await mongoose.connection.db.collection("units").dropIndex("unitNo_1");
console.log("✅ Index dropped");
process.exit(0);
