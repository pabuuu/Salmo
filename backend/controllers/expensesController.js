import Expense from "../models/Expense.js";
import Maintenance from "../models/Maintenance.js";
import Units from "../models/Units.js";
import { supabase } from "../supabase.js"; // Supabase client

// Helper: upload file to Supabase and return public URL
const uploadToSupabase = async (file) => {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.originalname}`;
  const { error } = await supabase.storage
    .from("receipts") // your Supabase bucket
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error("Failed to upload to Supabase");

  const { publicURL } = supabase.storage.from("receipts").getPublicUrl(fileName);
  return publicURL;
};

// 🟢 Create Expense
export const createExpense = async (req, res) => {
  try {
    const { title, description, category, amount, status, maintenanceId, unitId } = req.body;

    if (!title || !category || !amount) {
      return res.status(400).json({ success: false, message: "Title, category, and amount are required." });
    }

    let linkedMaintenance = null;
    if (category === "Maintenance" && maintenanceId) {
      linkedMaintenance = await Maintenance.findOne({ _id: maintenanceId, status: "In Process" });
      if (!linkedMaintenance) return res.status(404).json({ success: false, message: "Maintenance not found or not In Process." });
    }

    let linkedUnit = null;
    if (unitId) {
      linkedUnit = await Units.findById(unitId);
      if (!linkedUnit) return res.status(404).json({ success: false, message: "Unit not found." });
    }

    // Upload receipt if file exists
    const receiptUrl = req.file ? await uploadToSupabase(req.file) : null;

    const expense = new Expense({
      title,
      description,
      category,
      amount,
      status: status || "Pending",
      maintenanceId: linkedMaintenance?._id || null,
      unitId: linkedUnit?._id || null,
      receiptImage: receiptUrl,
    });

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate({ path: "maintenanceId", select: "task status unit", populate: { path: "unit", select: "unitNo location" } })
      .populate({ path: "unitId", select: "unitNo location" });

    res.status(201).json({ success: true, message: "Expense created successfully.", expense: populatedExpense });
  } catch (err) {
    console.error("❌ Error creating expense:", err);
    res.status(500).json({ success: false, message: "Server error creating expense." });
  }
};

// 🟠 Update Expense
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });

    const { title, description, category, amount, status, unitId, maintenanceId } = req.body;

    if (title) expense.title = title;
    if (description) expense.description = description;
    if (category) expense.category = category;
    if (amount) expense.amount = amount;
    if (status) expense.status = status;
    if (unitId) expense.unitId = unitId;
    if (maintenanceId) expense.maintenanceId = maintenanceId;

    // Upload new receipt if provided
    if (req.file) {
      expense.receiptImage = await uploadToSupabase(req.file);
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate({ path: "maintenanceId", select: "task status unit", populate: { path: "unit", select: "unitNo location" } })
      .populate({ path: "unitId", select: "unitNo location" });

    res.json({ success: true, expense: populatedExpense });
  } catch (err) {
    console.error("❌ Error updating expense:", err);
    res.status(500).json({ success: false, message: "Server error updating expense." });
  }
};

// 🔴 Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });

    // Delete receipt from Supabase
    if (expense.receiptImage) {
      const fileName = expense.receiptImage.split("/").pop();
      const { error } = await supabase.storage.from("receipts").remove([fileName]);
      if (error) console.error("❌ Supabase delete error:", error);
    }

    res.json({ success: true, message: "Expense deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ success: false, message: "Server error deleting expense." });
  }
};
