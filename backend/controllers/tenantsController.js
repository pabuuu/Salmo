import Tenants from '../models/Tenants.js';
import Units from '../models/Units.js';
import Payments from "../models/PaymentsSchema.js";
import dayjs from "dayjs";
import { recalcTenantBalance } from './paymentsController.js';
import { getNextDueDate } from '../utils/dateUtils.js';
import { supabase } from '../supabase.js';
import multer from 'multer';

// Multer memory storage for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// --------------------
// Helper: Upload to Supabase
// --------------------
export const uploadToSupabase = async (file, bucketName = "payment receipts") => {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return urlData?.publicUrl || null;
};

// --------------------
// Load all tenants
// --------------------
export const load = async (req, res) => {
  try {
    const tenants = await Tenants.find()
      .populate("unitId", "unitNo location rentAmount status")
      .exec();

    res.json({ success: true, data: tenants, message: "Tenants loaded successfully" });
  } catch (err) {
    console.error("Error loading tenants:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Create Tenant
// --------------------
export const createTenant = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      unitId,
      paymentFrequency,
      initialPayment = 0,
      contractStart,
      contractEnd,
      password,
      loginAttempts,
      lockUntil,
      resetToken,
      resetTokenExpires,
    } = req.body;

    // Validation
    if (!firstName || !lastName) return res.status(400).json({ success: false, message: "First and last name required" });
    if (!unitId) return res.status(400).json({ success: false, message: "Unit must be selected" });
    if (!paymentFrequency) return res.status(400).json({ success: false, message: "Payment frequency is required" });

    const unit = await Units.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
    if (unit.status === "Occupied") return res.status(400).json({ success: false, message: "Unit already occupied" });

    const rentAmount = unit.rentAmount;
    if (!rentAmount || rentAmount <= 0) return res.status(400).json({ success: false, message: "Invalid rent amount" });

    // File uploads
    let receiptUrl = null;
    let contractURL = null;
    if (req.files?.receipt?.[0]) receiptUrl = await uploadToSupabase(req.files.receipt[0], "payment receipts");
    if (req.files?.contractFile?.[0]) contractURL = await uploadToSupabase(req.files.contractFile[0], "contract-files");

    // Compute balance & status
    const balance = Math.max(rentAmount - initialPayment, 0);
    const status = balance === 0 ? "Paid" : initialPayment > 0 ? "Partial" : "Pending";

    const today = new Date();
    const nextDueDate = balance === 0 ? getNextDueDate(today, paymentFrequency) : today;
    const lastDueDate = initialPayment > 0 ? today : null;

    const tenant = await Tenants.create({
      firstName,
      lastName,
      email,
      contactNumber,
      unitId,
      paymentFrequency,
      initialPayment,
      balance,
      status,
      nextDueDate,
      lastDueDate,
      receiptUrl,
      contractStart,
      contractEnd,
      contractURL,
      password,
      loginAttempts,
      lockUntil,
      resetToken,
      resetTokenExpires,
    });

    // Mark unit as occupied
    await Units.findByIdAndUpdate(unitId, { status: "Occupied", tenant: tenant._id });

    // Record initial payment
    if (initialPayment > 0) {
      await Payments.create({
        tenantId: tenant._id,
        unitId,
        amount: initialPayment,
        paymentDate: today,
        paymentMethod: "Initial Payment",
        notes: "Recorded during tenant creation",
        receiptUrl,
      });

      await recalcTenantBalance(tenant._id);
    }

    res.status(201).json({ success: true, message: "Tenant created successfully", tenant });
  } catch (err) {
    console.error("❌ Error creating tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Get Single Tenant
// --------------------
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenants.findById(req.params.id)
      .populate("unitId", "unitNo location rentAmount status");

    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    res.json({ success: true, data: tenant });
  } catch (err) {
    console.error("Error fetching tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Update Tenant
// --------------------
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const tenant = await Tenants.findById(id);
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    // Handle unit reassignment
    if (updates.rentalUnit && updates.location) {
      if (tenant.unitId) {
        await Units.findOneAndUpdate(
          { _id: tenant.unitId, tenant: tenant._id },
          { status: "Available", tenant: null }
        );
      }

      const newUnit = await Units.findOne({ unitNo: updates.rentalUnit, location: updates.location });
      if (!newUnit) return res.status(400).json({ success: false, message: "New unit not found" });
      if (newUnit.status !== "Available") return res.status(400).json({ success: false, message: "New unit is not available" });

      newUnit.status = "Occupied";
      newUnit.tenant = tenant._id;
      await newUnit.save();

      updates.unitId = newUnit._id;
    }

    // Merge updates safely
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && updates[key] !== null) tenant[key] = updates[key];
    });

    await tenant.save();

    const updatedTenant = await Tenants.findById(id).populate("unitId", "unitNo location rentAmount status");
    res.status(200).json({ success: true, message: "Tenant updated successfully", data: updatedTenant });
  } catch (err) {
    console.error("Error updating tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Archive Tenant
// --------------------
export const archiveTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenants.findById(id);
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const newStatus = !tenant.isArchived;
    tenant.isArchived = newStatus;

    if (newStatus && tenant.unitId) {
      const unit = await Units.findById(tenant.unitId);

      tenant.lastUnitNo = unit?.unitNo || tenant.lastUnitNo || "N/A";
      tenant.lastRentAmount = unit?.rentAmount || tenant.lastRentAmount || 0;
      tenant.lastNextDueDate = tenant.nextDueDate || tenant.lastNextDueDate || null;

      await Units.findOneAndUpdate({ _id: tenant.unitId, tenant: tenant._id }, { status: "Available", tenant: null });
      tenant.unitId = null;
    }

    await tenant.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: newStatus
        ? "Tenant archived successfully. Unit freed."
        : "Tenant unarchived successfully. Please reassign a unit manually.",
      archived: newStatus,
    });
  } catch (err) {
    console.error("Error archiving tenant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --------------------
// Get Tenants (with updated status)
// --------------------
export const getTenants = async (req, res) => {
  try {
    const tenantsFromDb = await Tenants.find()
      .populate({ path: "unitId", select: "unitNo rentAmount location status" })
      .lean();

    const today = new Date();

    const updatedTenants = tenantsFromDb.map((t) => {
      const balance = t.balance ?? t.unitId?.rentAmount ?? 0;
      let status = t.status || "Pending";

      if (balance === 0) status = "Paid";
      else if (balance > 0 && t.initialPayment > 0) status = "Partial";
      else if (balance > 0 && t.initialPayment === 0 && new Date(t.nextDueDate) < today) status = "Overdue";
      else if (balance > 0) status = "Pending";

      return { ...t, status, rentAmount: t.unitId?.rentAmount ?? 0 };
    });

    res.status(200).json({ success: true, data: updatedTenants, message: "Tenants loaded successfully" });
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to load tenants" });
  }
};

// --------------------
// Delete Tenant Permanently
// --------------------
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenants.findById(id);
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    if (tenant.unitId) await Units.findByIdAndUpdate(tenant.unitId, { status: "Available", tenant: null });
    await Tenants.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Tenant deleted successfully" });
  } catch (err) {
    console.error("Error deleting tenant:", err);
    res.status(500).json({ success: false, message: "Failed to delete tenant" });
  }
};

// --------------------
// Assign Unit to Tenant (Fresh Start)
// --------------------
export const assignUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { unitId } = req.body;

    const tenant = await Tenants.findById(id);
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const unit = await Units.findById(unitId);
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });
    if (unit.status !== "Available") return res.status(400).json({ success: false, message: "Unit is not available" });

    if (tenant.unitId) await Units.findOneAndUpdate({ _id: tenant.unitId, tenant: tenant._id }, { status: "Available", tenant: null });

    await Payments.deleteMany({ tenantId: tenant._id });

    tenant.unitId = unit._id;
    tenant.location = unit.location || tenant.location;
    tenant.balance = unit.rentAmount;
    tenant.status = "Pending";
    tenant.lastDueDate = null;
    tenant.lastNextDueDate = null;
    tenant.nextDueDate = getNextDueDate(new Date(), tenant.paymentFrequency || "Monthly");
    tenant.isArchived = false;

    await tenant.save({ validateBeforeSave: false });

    unit.tenant = tenant._id;
    unit.status = "Occupied";
    await unit.save();

    await recalcTenantBalance(tenant._id, new Date());

    const updatedTenant = await Tenants.findById(tenant._id).populate("unitId", "unitNo rentAmount location status");

    res.json({
      success: true,
      message: `Tenant assigned to Unit ${unit.unitNo} (${unit.location}) successfully. Fresh start applied.`,
      tenant: updatedTenant,
    });
  } catch (err) {
    console.error("Error assigning unit:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
