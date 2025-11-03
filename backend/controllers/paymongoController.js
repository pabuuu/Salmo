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
    const event = req.body;

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;

      // Find pending payment
      const payment = await Payment.findOne({ "notes": new RegExp(intent.id) });
      if (payment) {
        payment.status = "Paid";  // enum safe
        payment.receiptUrl = intent.attributes?.statement_descriptor || null;
        await payment.save();

        // Update tenant balance
        const tenant = await Tenant.findById(payment.tenantId);
        if (tenant) {
          tenant.balance -= payment.amount;
          await tenant.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ success: false });
  }
};
