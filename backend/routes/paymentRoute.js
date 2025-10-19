import express from "express";
import multer from "multer";
import {
  createPayment,
  getTenantPayments,
  getAllPayments
} from "../controllers/paymentsController.js";

const paymentRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

paymentRoute.post("/create", upload.single("receipt"), createPayment);

// 🔹 Get tenant payments
paymentRoute.get("/:id/payments", getTenantPayments);  
paymentRoute.get("/tenant/:tenantId", getTenantPayments);  // e.g., /api/payments/tenant/123

// 🔹 Get all payments
paymentRoute.get("/all", getAllPayments);

export default paymentRoute;
