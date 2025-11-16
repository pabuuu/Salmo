import express from "express";
import multer from "multer";
import {
  createPayment,
  getTenantPayments,
  getAllPayments,
  customerCreatePayment,
  approvePayment
} from "../controllers/paymentsController.js";

const paymentRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔹 Create payment with receipt
paymentRoute.post("/create", upload.single("receipt"), createPayment);

// 🔹 Get tenant payments
paymentRoute.get("/:id/payments", getTenantPayments);
paymentRoute.get("/tenant/:tenantId", getTenantPayments);

// 🔹 Get all payments
paymentRoute.get("/all", getAllPayments);

paymentRoute.post(
  "/customer-upload",
  upload.single("receipt"),
  customerCreatePayment
);

// 🔹 Approve payment
paymentRoute.put("/approve/:id", approvePayment);

export default paymentRoute;