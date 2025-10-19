import Expense from "../models/Expense.js";
import Maintenance from "../models/Maintenance.js";
import Units from "../models/Units.js";
import { supabase } from "../supabase.js"; 

const uploadToSupabase = async (file) => {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("receipt") // your Supabase bucket
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true, // allows replacing existing filename if necessary
    });

  if (uploadError) throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);

  const { data: urlData, error: urlError } = supabase.storage
    .from("receipt")
    .getPublicUrl(fileName);

  if (urlError || !urlData?.publicUrl) throw new Error("Failed to get Supabase public URL");
  return urlData.publicUrl;
};

// CREATE Expense
export const createExpense = async (req, res) => {
  try {
    const { title, description, category, amount, status, maintenanceId, unitId } = req.body;

    if (!title || !category || !amount) {
      return res.status(400).json({ success: false, message: "Title, category, and amount are required." });
    }

    let linkedMaintenance = null;
    if (category === "Maintenance" && maintenanceId) {
      linkedMaintenance = await Maintenance.findOne({ _id: maintenanceId, status: "In Process" });
      if (!linkedMaintenance)
        return res.status(404).json({ success: false, message: "Maintenance not found or not In Process." });
    }

    let linkedUnit = null;
    if (unitId) {
      linkedUnit = await Units.findById(unitId);
      if (!linkedUnit) return res.status(404).json({ success: false, message: "Unit not found." });
    }

    // Upload to Supabase
    const receiptUrl = req.file ? await uploadToSupabase(req.file) : null;

    const expense = new Expense({
      title,
      description,
      category,
      amount,
      status: status || "Pending",
      maintenanceId: linkedMaintenance?._id || null,
      unitId: linkedUnit?._id || null,
      receiptImage: receiptUrl, // store full Supabase URL
    });

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate({ path: "maintenanceId", select: "task status unit", populate: { path: "unit", select: "unitNo location" } })
      .populate({ path: "unitId", select: "unitNo location" });

    res.status(201).json({ success: true, message: "Expense created successfully.", expense: populatedExpense });
  } catch (err) {
    console.error("Error creating expense:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ: Get all Expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate({ path: "maintenanceId", select: "task status unit", populate: { path: "unit", select: "unitNo location" } })
      .populate({ path: "unitId", select: "unitNo location" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, expenses });
  } catch (err) {
    console.error("Error fetching expenses:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching expenses." });
  }
};

// READ: Get Expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate({ path: "maintenanceId", select: "task status unit", populate: { path: "unit", select: "unitNo location" } })
      .populate({ path: "unitId", select: "unitNo location" });

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });

    res.status(200).json({ success: true, expense });
  } catch (err) {
    console.error("Error fetching expense:", err.message);
    res.status(500).json({ success: false, message: "Server error fetching expense." });
  }
};

// UPDATE Expense
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

    // If a new file is uploaded, replace the old one in Supabase
    if (req.file) {
      const receiptUrl = await uploadToSupabase(req.file);
      expense.receiptImage = receiptUrl; // replace with new Supabase link
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate({ path: "maintenanceId", select: "task status unit", populate: { path: "unit", select: "unitNo location" } })
      .populate({ path: "unitId", select: "unitNo location" });

    res.json({ success: true, expense: populatedExpense });
  } catch (err) {
    console.error("Error updating expense:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE Expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });

    // Delete file from Supabase
    if (expense.receiptImage) {
      const fileName = expense.receiptImage.split("/").pop();
      const { error } = await supabase.storage.from("receipt").remove([fileName]);
      if (error) console.error("Supabase delete error:", error.message);
    }

    res.json({ success: true, message: "Expense deleted successfully." });
  } catch (err) {
    console.error("Error deleting expense:", err.message);
    res.status(500).json({ success: false, message: "Server error deleting expense." });
  }
};
