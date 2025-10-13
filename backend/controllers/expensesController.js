import Expense from "../models/Expense.js";
import Maintenance from "../models/Maintenance.js";
import Units from "../models/Units.js"; // ✅ added for optional unit selection

// 🟢 Create Expense
export const createExpense = async (req, res) => {
  try {
    const { title, description, category, amount, status, maintenanceId, unitId } = req.body;

    if (!title || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and amount are required.",
      });
    }

    let linkedMaintenance = null;
    let finalStatus = status || "Pending";

    // ✅ Handle Maintenance-specific logic
    if (category === "Maintenance") {
      if (!maintenanceId) {
        return res.status(400).json({
          success: false,
          message: "Maintenance ID is required for Maintenance expenses.",
        });
      }

      linkedMaintenance = await Maintenance.findOne({
        _id: maintenanceId,
        status: "In Process",
      });

      if (!linkedMaintenance) {
        return res.status(404).json({
          success: false,
          message: "Maintenance not found or not currently In Process.",
        });
      }
    }

    // ✅ If unitId is provided, check if it exists
    let linkedUnit = null;
    if (unitId) {
      linkedUnit = await Units.findById(unitId);
      if (!linkedUnit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found. Please choose a valid unit.",
        });
      }
    }

    // Create Expense
    const expense = new Expense({
        title,
        description,
        category,
        amount,
        status: finalStatus,
        maintenanceId: linkedMaintenance ? linkedMaintenance._id : null,
        unitId: linkedUnit ? linkedUnit._id : null, // ✅ ensure null if not selected
        });

    await expense.save();

    // Populate maintenance and unit for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate({
        path: "maintenanceId",
        select: "task status unit",
        populate: { path: "unit", select: "unitNo location" },
      })
      .populate({ path: "unitId", select: "unitNo location" }); // ✅ populate unit

    res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense: populatedExpense,
    });
  } catch (err) {
    console.error("❌ Error creating expense:", err);
    res.status(500).json({ success: false, message: "Server error creating expense." });
  }
};

// 🟡 Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate({
        path: "maintenanceId",
        select: "task status unit",
        populate: { path: "unit", select: "unitNo location" },
      })
      .populate({ path: "unitId", select: "unitNo location" }) // ✅ populate optional unit
      .sort({ createdAt: -1 });

    res.json({ success: true, expenses });
  } catch (err) {
    console.error("❌ Error fetching expenses:", err);
    res.status(500).json({ success: false, message: "Server error fetching expenses." });
  }
};

// 🔵 Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate({
        path: "maintenanceId",
        select: "task status unit",
        populate: { path: "unit", select: "unitNo location" },
      })
      .populate({ path: "unitId", select: "unitNo location" }); // ✅ populate optional unit

    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found." });

    res.json({ success: true, expense });
  } catch (err) {
    console.error("❌ Error fetching expense:", err);
    res.status(500).json({ success: false, message: "Server error fetching expense." });
  }
};

// 🟠 Update expense
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate({
        path: "maintenanceId",
        select: "task status unit",
        populate: { path: "unit", select: "unitNo location" },
      })
      .populate({ path: "unitId", select: "unitNo location" }); // ✅ populate optional unit

    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found." });

    res.json({ success: true, expense });
  } catch (err) {
    console.error("❌ Error updating expense:", err);
    res.status(500).json({ success: false, message: "Server error updating expense." });
  }
};

// 🔴 Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense)
      return res.status(404).json({ success: false, message: "Expense not found." });

    res.json({ success: true, message: "Expense deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ success: false, message: "Server error deleting expense." });
  }
};
