import PaymentsSchema from "../models/PaymentsSchema.js";
import Tenant from "../models/Tenants.js";
import { getNextDueDate } from '../utils/dateUtils.js';


// Utility: recompute tenant balance + status from all payments
export const recalcTenantBalance = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).populate("unitId", "rentAmount paymentFrequency");
  if (!tenant) return;

  const payments = await PaymentsSchema.find({ tenantId });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const rentAmount = tenant.unitId?.rentAmount || 0;
  const frequency = tenant.paymentFrequency || tenant.unitId?.paymentFrequency || "Monthly";

  let balance = Math.max(rentAmount - totalPaid, 0);
  let status = "Pending";
  let nextDueDate = tenant.nextDueDate || new Date();

  if (balance === 0) {
    status = "Paid";
    // Advance next due date if fully paid
    if (!tenant.nextDueDate || tenant.balance > 0) {
      nextDueDate = getNextDueDate(new Date(), frequency);
    }
  } else if (balance > 0 && totalPaid > 0) {
    status = "Partial"; // <-- this ensures partial payments are NOT overdue
  } else if (balance > 0 && totalPaid === 0) {
    // Only mark overdue if completely unpaid AND past due date
    if (new Date(tenant.nextDueDate) < new Date()) status = "Overdue";
  }

  tenant.balance = balance;
  tenant.status = status;
  tenant.nextDueDate = nextDueDate;
  await tenant.save();
};

// =====================================================
// CREATE PAYMENT
// =====================================================
export const createPayment = async (req, res) => {
  try {
    const { tenantId, amount, paymentDate, paymentMethod, notes } = req.body;

    if (!tenantId || !amount || amount <= 0)
      return res.status(400).json({ success: false, message: "tenantId and valid amount are required" });

    const tenant = await Tenant.findById(tenantId).populate("unitId", "rentAmount paymentFrequency");
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    // Create payment record
    const payment = await PaymentsSchema.create({
      tenantId,
      unitId: tenant.unitId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || "Cash",
      notes: notes || "",
    });

    // Recalculate tenant balance & status correctly
    await recalcTenantBalance(tenantId);

    // Fetch updated tenant after recalculation
    const updatedTenant = await Tenant.findById(tenantId);

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
      updatedTenant,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// UPDATE PAYMENT
// =====================================================
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, notes } = req.body;

    const payment = await PaymentsSchema.findById(id);
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    // Update fields
    if (amount !== undefined) payment.amount = amount;
    if (paymentDate) payment.paymentDate = paymentDate;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (notes) payment.notes = notes;

    await payment.save();

    // Recalculate tenant data
    await recalcTenantBalance(payment.tenantId);

    res.status(200).json({ success: true, message: "Payment updated successfully", payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// DELETE PAYMENT
// =====================================================
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await PaymentsSchema.findById(id);
    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found" });

    await payment.deleteOne();

    // Recalculate tenant data
    await recalcTenantBalance(payment.tenantId);

    res.status(200).json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// GET TENANT PAYMENTS
// =====================================================
export const getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.params.tenantId || req.params.id;
    if (!tenantId)
      return res.status(400).json({ success: false, message: "tenantId required" });

    const tenant = await Tenant.findById(tenantId).populate("unitId", "unitNo location rentAmount status");
    if (!tenant)
      return res.status(404).json({ success: false, message: "Tenant not found" });

    const payments = await PaymentsSchema.find({ tenantId }).sort({ paymentDate: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: { tenant, payments },
    });
  } catch (err) {
    console.error("Error fetching tenant payments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================================
// GET ALL PAYMENTS (ADMIN)
// =====================================================
export const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentsSchema
      .find()
      .populate("tenantId", "firstName lastName")
      .populate("unitId", "unitNo")
      .sort({ paymentDate: -1 })
      .lean();

    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    console.error("Error fetching all payments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
