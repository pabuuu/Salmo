import User from "../models/User.js";
import Tenant from "../models/Tenants.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ===============================
// ADMIN / STAFF / SUPERADMIN LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({
        success: false,
        message: "Username/Email and password are required.",
      });

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user)
      return res.status(401).json({ success: false, message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password." });

    // 🔹 Use the actual DB field name
    const isTempPassword = !!user.isTemporaryPassword;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username || "",
        email: user.email,
        role: user.role,
        isTemporaryPassword: isTempPassword, // ✅ consistent naming
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ===============================
// SET NEW PASSWORD (Admin/Staff)
// ===============================
export const setNewPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword))
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character.",
      });

    // 🔹 Update password and mark as permanent
    user.password = await bcrypt.hash(newPassword, 10);
    user.isTemporaryPassword = false;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isTemporaryPassword: user.isTemporaryPassword,
      },
    });
  } catch (error) {
    console.error("Set new password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again later." });
  }
};

// ===============================
// CHECK TEMPORARY PASSWORD (Admin/Staff)
// ===============================
export const checkTemporaryPassword = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });

    return res.json({
      success: true,
      isTemporaryPassword: !!user.isTemporaryPassword,
    });
  } catch (error) {
    console.error("Error checking temporary password:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ===============================
// TENANT LOGIN
// ===============================
export const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });

    const tenant = await Tenant.findOne({ email });
    if (!tenant)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });

    if (tenant.lockUntil && tenant.lockUntil > Date.now()) {
      const remainingSeconds = Math.ceil((tenant.lockUntil - Date.now()) / 1000);
      return res.status(403).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingSeconds} second(s).`,
      });
    }

    if (!tenant.password)
      return res.status(403).json({
        success: false,
        message: "You have not set a password yet. Please set one first.",
      });

    const isMatch = await bcrypt.compare(password, tenant.password);
    if (!isMatch) {
      tenant.loginAttempts += 1;

      if (tenant.loginAttempts >= 2) { 
        tenant.lockUntil = new Date(Date.now() + 30 * 1000); 
        tenant.loginAttempts = 0;
      }

      await tenant.save();
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    tenant.loginAttempts = 0;
    tenant.lockUntil = null;
    await tenant.save();

    const token = jwt.sign(
      { id: tenant._id, role: "customer" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Tenant login successful.",
      token,
      tenant: {
        id: tenant._id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        unitId: tenant.unitId,
        isTemporaryPassword:
          !!tenant.isTemporaryPassword || tenant.password === null,
      },
    });
  } catch (err) {
    console.error("Customer login error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


// ===============================
// CHECK IF TENANT HAS PASSWORD
// ===============================
export const checkCustomerPassword = async (req, res) => {
  const { email, contactNumber } = req.body;

  try {
    const tenant = await Tenant.findOne({ $or: [{ email }, { contactNumber }] });
    if (!tenant)
      return res.json({ success: false, message: "Tenant not found." });

    const isNullPassword = tenant.password === null;

    return res.json({
      success: true,
      isNullPassword,
      tenantId: tenant._id,
    });
  } catch (error) {
    console.error("Error checking tenant password:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ===============================
// CREATE / SET TENANT PASSWORD
// ===============================
export const createPass = async (req, res) => {
  const { tenantId, newPassword } = req.body;

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant)
      return res.json({ success: false, message: "Tenant not found." });

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword))
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    tenant.password = hashedPassword;
    tenant.isTemporaryPassword = false;
    await tenant.save();

    return res.json({
      success: true,
      message: "Password successfully set.",
    });
  } catch (error) {
    console.error("Error setting tenant password:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
