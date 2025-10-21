import PaymentsSchema from "../models/PaymentsSchema.js";
import Tenants from "../models/Tenants.js";
import { supabase } from "../supabase.js";
import { getNextDueDate } from '../utils/dateUtils.js';


const uploadToSupabase = async (file) => {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("payment receipts") 
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);

  const { data: urlData, error: urlError } = supabase.storage
    .from("payment receipts")
    .getPublicUrl(fileName);

  if (urlError || !urlData?.publicUrl)
    throw new Error("Failed to get Supabase public URL");

  return urlData.publicUrl;
};

export const recalcTenantBalance = async (tenantId) => {
  const tenant = await Tenants.findById(tenantId)
    .populate("unitId", "rentAmount paymentFrequency");
  if (!tenant) return;

  const payments = await PaymentsSchema.find({ tenantId });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const rentAmount = tenant.unitId?.rentAmount || 0;
  const frequency = tenant.paymentFrequency || tenant.unitId?.paymentFrequency || "Monthly";

  if (!rentAmount || rentAmount <= 0) return;

  // 🧮 How many months worth of rent total have been paid
  const fullPeriodsPaid = Math.floor(totalPaid / rentAmount);

  // 🗓 Determine how many months have already been advanced
  const today = new Date();
  const originalNextDue = tenant.nextDueDate || today;

  // how many months ahead of today the nextDueDate already is
  const monthsAhead = Math.max(
    0,
    (originalNextDue.getFullYear() - today.getFullYear()) * 12 +
      (originalNextDue.getMonth() - today.getMonth())
  );

  // Only advance for *newly covered* months
  const newPeriodsToAdvance = Math.max(0, fullPeriodsPaid - monthsAhead);

  let nextDueDate = originalNextDue;
  for (let i = 0; i < newPeriodsToAdvance; i++) {
    nextDueDate = getNextDueDate(nextDueDate, frequency);
  }

  const remainingBalance = rentAmount - (totalPaid % rentAmount);

  let status = "Pending";
  if (remainingBalance === rentAmount && fullPeriodsPaid > 0) {
    status = "Paid";
  } else if (remainingBalance < rentAmount && remainingBalance > 0) {
    status = "Partial";
  } else if (totalPaid === 0 && new Date(tenant.nextDueDate) < today) {
    status = "Overdue";
  }

  tenant.balance = remainingBalance;
  tenant.status = status;
  tenant.nextDueDate = nextDueDate;
  await tenant.save();
};

export const createPayment = async (req, res) => {
  try {
    const { tenantId, amount, paymentDate, paymentMethod, notes } = req.body;
    const file = req.file; // file comes from multer

    if (!tenantId || !amount || amount <= 0)
      return res.status(400).json({ success: false, message: "tenantId and valid amount are required" });

    const tenant = await Tenants.findById(tenantId).populate("unitId", "rentAmount paymentFrequency");
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    // ✅ Upload receipt if provided
    let receiptUrl = null;
    if (file) {
      receiptUrl = await uploadToSupabase(file);
    }

    const payment = await PaymentsSchema.create({
      tenantId,
      unitId: tenant.unitId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || "Cash",
      notes: notes || "",
      receiptUrl, 
    });

    //Recalculate tenant balance
    await recalcTenantBalance(tenantId);

    const updatedTenant = await Tenants.findById(tenantId);

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

export const getTenantPayments = async (req, res) => {
  try {
    const tenantId = req.params.tenantId || req.params.id;
    if (!tenantId)
      return res.status(400).json({ success: false, message: "tenantId required" });

    const tenant = await Tenants.findById(tenantId).populate("unitId", "unitNo location rentAmount status");
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
