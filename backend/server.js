import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tenantRouter from "./routes/tenantRoute.js";  // ✅ match export name
import unitRouter from "./routes/unitRoute.js";      // ✅ match export name

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRouter); // ✅ singular
app.use("/api/units", unitRouter);     // ✅ singular

// Health check
app.get("/", (req, res) => {
  res.send("Server is working!");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
