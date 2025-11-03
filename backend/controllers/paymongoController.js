import { createPaymentIntent } from "../utils/paymongo.js"; // PayMongo helper
import Payment from "../models/PaymentsSchema.js";         // Payment model
import Tenant from "../models/Tenants.js";                 // Tenant model

// Create PayMongo Payment Intent and return checkout URL
export const createPayMongoIntent = async (req, res) => {
  try {
    const { amount, currency, tenantId, notes } = req.body;

    if (!amount || !tenantId) {
      return res.status(400).json({ success: false, message: "Amount and tenantId are required" });
    }

    // 1. Fetch tenant
    const tenant = await Tenant.findById(tenantId).populate("unitId");
    if (!tenant || !tenant.unitId) {
      return res.status(404).json({ success: false, message: "Tenant or unit not found" });
    }

    // 2. Create PayMongo Payment Intent
    const paymentIntent = await createPaymentIntent(amount, currency || "PHP");

    // Make sure client_key exists
    const clientKey = paymentIntent?.data?.attributes?.client_key;
    if (!clientKey) {
      return res.status(500).json({ success: false, message: "PayMongo client_key not returned" });
    }

    // 3. Store temporary payment in DB
    await Payment.create({
      tenantId: tenant._id,
      unitId: tenant.unitId._id,
      amount: amount / 100,        // convert centavos to PHP
      paymentMethod: "Other",      // enum safe
      notes: notes || `PayMongo Payment Intent ID: ${paymentIntent.data.id}`,
      status: "Pending",           // enum safe
      receiptUrl: null,
    });

    // 4. Send checkout URL to frontend
    const checkoutUrl = `https://checkout.paymongo.com/?intent_client_key=${clientKey}`;
    res.status(200).json({ success: true, data: { checkoutUrl } });
  } catch (err) {
    console.error("Error creating PayMongo intent:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to create PayMongo intent", error: err.message });
  }
};

// PayMongo Webhook to update payment status
export const handlePayMongoWebhook = async (req, res) => {
  try {
    console.log("📩 PayMongo Webhook received:", req.body); // ✅ Add this
    const event = req.body;

    console.log("Received PayMongo event:", eventType);

    if (eventType === "payment.paid") {
      const paymentData = event.attributes;

      // You can store the PayMongo payment ID in your Payment model when creating the payment
      const paymongoId = paymentData.id || paymentData.reference_number;

      // Find payment using the PayMongo ID you stored earlier
      const payment = await Payment.findOne({ paymongoId });

      if (payment) {
        payment.status = "Paid";
        payment.receiptUrl = paymentData.receipt?.url || null;
        await payment.save();

        // Optional: update tenant balance
        const tenant = await Tenant.findById(payment.tenantId);
        if (tenant) {
          tenant.balance -= payment.amount;
          await tenant.save();
        }
      }
    }

    // Optional: handle failed payments
    else if (eventType === "payment.failed") {
      const paymentData = event.attributes;
      const paymongoId = paymentData.id || paymentData.reference_number;

      const payment = await Payment.findOne({ paymongoId });
      if (payment) {
        payment.status = "Failed";
        await payment.save();
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};