import User from "../models/User.js";
import Tenant from "../models/Tenants.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const tenant = await Tenant.findOne({ email });
    if (!tenant)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    if (tenant.lockUntil && tenant.lockUntil > Date.now()) {
      const remainingMs = tenant.lockUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      return res.status(403).json({
        success: false,
        message: `Too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
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

      if (tenant.loginAttempts >= 3) {
        tenant.lockUntil = new Date(Date.now() + 5 * 60 * 1000);
        tenant.loginAttempts = 0;
      }

      await tenant.save();
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    tenant.loginAttempts = 0;
    tenant.lockUntil = null;
    await tenant.save();

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
        unitId: tenant.unitId,
      },
    });
  } catch (err) {
    console.error("Customer login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkCustomerPassword = async (req, res) => {
  const { email, contactNumber } = req.body;

  try {
    const tenant = await Tenant.findOne({
      $or: [{ email }, { contactNumber }],
    });

    if (!tenant) {
      return res.json({ success: false, message: "Tenant not found" });
    }

    const isNullPassword = tenant.password === null;

    return res.json({
      success: true,
      isNullPassword,
      tenantId: tenant._id,
    });
  } catch (error) {
    console.error("Error checking password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const createPass = async (req, res) => {
  const { tenantId, newPassword } = req.body;

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.json({ success: false, message: "Tenant not found." });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    tenant.password = hashedPassword;
    await tenant.save();

    res.json({ success: true, message: "Password successfully set." });
  } catch (error) {
    console.error("Error setting password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
