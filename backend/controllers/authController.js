// backend/controllers/authController.js
import User from "../models/User.js";
import Tenant from "../models/Tenants.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔐 ADMIN LOGIN
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 👥 CUSTOMER LOGIN
export const customerLogin = async (req, res) => {
  try {
    const { email, contactNumber } = req.body;

    if (!email || !contactNumber)
      return res
        .status(400)
        .json({ success: false, message: "Email and contact number are required" });

    const tenant = await Tenant.findOne({ email, contactNumber });

    if (!tenant)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or contact number" });

    const token = jwt.sign(
      { id: tenant._id, role: "customer" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      tenant: {
        id: tenant._id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        contactNumber: tenant.contactNumber,
        unitId: tenant.unitId,
      },
    });
  } catch (err) {
    console.error("Customer login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
