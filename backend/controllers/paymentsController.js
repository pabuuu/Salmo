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

// helper: advance date by N months
const addMonths = (date, months) => {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  const year = d.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;
  const day = Math.min(d.getDate(), new Date(year, month + 1, 0).getDate());
  return new Date(year, month, day);
};

export const recalcTenantBalance = async (tenantId) => {
  // Load tenant with unit details
  const tenant = await Tenants.findById(tenantId)
    .populate("unitId", "rentAmount paymentFrequency");
  if (!tenant) return;

  const rentAmount = tenant.unitId?.rentAmount || 0;
  if (!rentAmount || rentAmount <= 0) return;

  // Determine frequency
  const frequency = tenant.paymentFrequency || tenant.unitId?.paymentFrequency || "Monthly";

  // Multiplier for periods
  const multiplier =
    frequency === "Monthly" ? 1 :
    frequency === "Quarterly" ? 3 :
    frequency === "Yearly" ? 12 : 1;

  const periodRent = rentAmount * multiplier;

  // Get all payments
  const payments = await PaymentsSchema.find({ tenantId });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Determine base date (lastDueDate is mandatory)
  const baseDate = tenant.lastDueDate || new Date();

  // Number of full periods covered by payments
  const fullPeriodsPaid = Math.floor(totalPaid / periodRent);

  // Advance nextDueDate by number of full periods
  let nextDueDate = new Date(baseDate);
  for (let i = 0; i < fullPeriodsPaid; i++) {
    nextDueDate = addMonths(nextDueDate, multiplier);
  }

  // Calculate remaining balance for current period
  const remainder = totalPaid % periodRent;
  const remainingBalance = remainder === 0 ? 0 : periodRent - remainder;

  // Determine status
  let status = "Pending";
  const today = new Date();

  if (remainingBalance === 0 && totalPaid > 0) status = "Paid";
  else if (remainingBalance > 0 && remainingBalance < periodRent) status = "Partial";
  else if (totalPaid === 0 && nextDueDate < today) status = "Overdue";

  // Save updates
  tenant.balance = remainingBalance;
  tenant.status = status;

  // Update lastDueDate to last period fully covered
  tenant.lastDueDate = baseDate;

  // Set next due date for the current period
  tenant.nextDueDate = nextDueDate;

  await tenant.save();

  return {
    tenantId: tenant._id,
    status,
    balance: remainingBalance,
    nextDueDate,
  };
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
    const payments = await PaymentsSchema.find()
      .populate("tenantId", "firstName lastName isArchived") 
      .populate("unitId", "unitNo")
      .sort({ paymentDate: -1 })
      .lean();

    const validPayments = payments.filter(p => p.tenantId !== null);

    res.status(200).json({ success: true, data: validPayments });
  } catch (err) {
    console.error("Error fetching all payments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

