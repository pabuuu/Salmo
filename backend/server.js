import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import tenantRouter from "./routes/tenantRoute.js";
import unitRouter from "./routes/unitRoute.js";
import maintenanceRouter from "./routes/maintenanceRoute.js"; 
import paymentRoute from "./routes/paymentRoute.js";
import testEmailRoutes from "./routes/testEmailRoutes.js";
import { initScheduler } from "./utils/mailScheduler.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

initScheduler();
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRouter);
app.use("/api/units", unitRouter);
app.use("/api/maintenances", maintenanceRouter); // ✅ mount maintenance routes
app.use("/api/payments", paymentRoute);
app.use("/api/test", testEmailRoutes);
// Health check
app.get("/", (req, res) => {
  res.send("Server is working!");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
