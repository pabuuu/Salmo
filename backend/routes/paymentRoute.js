import express from "express";
import { createPayment, getTenantPayments ,getAllPayments} from "../controllers/paymentsController.js";

const paymentRoute = express.Router();

// create payment
paymentRoute.post("/create", createPayment);

// get tenant payments — keep both patterns so your frontend works either way
paymentRoute.get("/:id/payments", getTenantPayments);           // existing style: /api/payments/:id/payments
paymentRoute.get("/tenant/:tenantId", getTenantPayments);      // explicit: /api/payments/tenant/:tenantId
paymentRoute.get("/all", getAllPayments);

export default paymentRoute;
