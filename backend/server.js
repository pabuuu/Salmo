import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import tenantRouter from "./routes/tenantRoute.js";
import unitRouter from "./routes/unitRoute.js";
import maintenanceRouter from "./routes/maintenanceRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import expenseRoute from "./routes/expenseRoute.js";
import testEmailRoutes from "./routes/testEmailRoutes.js";
import customerRoute from "./routes/customerRoute.js";

// Utils
import { initScheduler } from "./utils/mailScheduler.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Middleware
app.use(cors());

// ⚠️ Must come BEFORE express.json()
// This ensures PayMongo webhook receives the raw body (not parsed JSON)
app.use("/api/payments/paymongo/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Initialize scheduled jobs (like email reminders)
initScheduler();

// ✅ API Routes
app.use("/api/auth", authRoutes);          // Admin + Customer login routes
app.use("/api/tenants", tenantRouter);
app.use("/api/units", unitRouter);
app.use("/api/maintenances", maintenanceRouter);
app.use("/api/expenses", expenseRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/test", testEmailRoutes);
app.use("/api/customers", customerRoute);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
