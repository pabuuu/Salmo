import paymentsSchema from "../models/PaymentsSchema.js";
import Tenant from "../models/Tenants.js";

const getNextDueDate = (currentDueDate, frequency) => {
  const next = new Date(currentDueDate);

  if (frequency === "Monthly") next.setMonth(next.getMonth() + 1);
  else if (frequency === "Quarterly") next.setMonth(next.getMonth() + 3);
  else if (frequency === "Yearly") next.setFullYear(next.getFullYear() + 1);

  return next;
};

export const createPayment = async (req, res) => {
  try {
    const { tenantId, amount, paymentDate, paymentMethod, notes } = req.body;

    // 🔹 Find the tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    // 🔹 Create the payment record
    const payment = await paymentsSchema.create({
      tenantId,
      unitId: tenant.unitId,
      amount,
      paymentDate,
      paymentMethod,
      notes,
      status: "Paid",
    });

    // 🔹 Deduct from balance
    let newBalance = (tenant.balance || tenant.rentAmount) - amount;

    // 🔹 Prevent negative balance
    if (newBalance < 0) newBalance = 0;

    // 🔹 Determine new status
    let newStatus = "Paid";
    if (newBalance > 0) {
      // 🔹 Step 2: Check overdue
      const today = new Date();
      newStatus = new Date(tenant.nextDueDate) < today ? "Overdue" : "Partial";
    }

    // 🔹 Adjust next due date if fully paid
    let nextDueDate = tenant.nextDueDate;
    if (newStatus === "Paid") {
      nextDueDate = getNextDueDate(tenant.nextDueDate, tenant.paymentFrequency);
    }

    // 🔹 Update tenant document
    await Tenant.findByIdAndUpdate(tenantId, {
      balance: newBalance,
      status: newStatus,
      nextDueDate,
      lastPaymentDate: paymentDate,
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
      updatedTenant: {
        balance: newBalance,
        status: newStatus,
        nextDueDate,
      },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTenantPayments = async (req, res) => {
  try {
    // support both routes: /api/payments/:id/payments  and /api/payments/tenant/:tenantId
    const tenantId = req.params.tenantId || req.params.id;
    if (!tenantId) return res.status(400).json({ success: false, message: "tenantId required" });

    // fetch tenant (with unit info)
    const tenant = await Tenant.findById(tenantId).populate("unitId", "unitNo location rentAmount status");
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    // fetch payments for that tenant (most recent first)
    const payments = await paymentsSchema.find({ tenantId }).sort({ paymentDate: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: {
        tenant,
        payments,
      },
    });
  } catch (err) {
    console.error("Error fetching tenant payments:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentsSchema.find().sort({ paymentDate: 1 }).lean();
    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    console.error("Error fetching all payments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};