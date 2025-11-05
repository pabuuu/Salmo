import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../supabase.js";
import { sendEmail, sendPasswordResetEmail } from "../utils/sendEmails.js"; // ✅ both utils

dotenv.config();

// =========================
// 🔹 GET ALL USERS
// =========================
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// =========================
// 🔹 GET USERS BY ROLE
// =========================
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ message: "Failed to fetch users by role" });
  }
};

// =========================
// 🔹 REGISTER USER (with welcome email)
// =========================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, contactNumber } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Handle optional uploads
    let validIdUrl = "";
    let resumeUrl = "";

    if (req.files?.validId?.[0]) {
      const file = req.files.validId[0];
      const fileName = `validIds/${Date.now()}_${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("users")
        .upload(fileName, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      validIdUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.path}`;
    }

    if (req.files?.resume?.[0]) {
      const file = req.files.resume[0];
      const fileName = `resumes/${Date.now()}_${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("users")
        .upload(fileName, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      resumeUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.path}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      validId: validIdUrl || undefined,
      resume: resumeUrl || undefined,
    });

    await user.save();

    // ✅ Send Welcome Email
    const subject = `Welcome to Rangeles Admin Portal`;
    const message = `
      Hello ${fullName},

      You have been registered as a ${role.toUpperCase()} in the Rangeles Admin Portal.

      📧 Login Email: ${email}
      🔑 Temporary Password: ${password}

      Please change your password after your first login for security purposes.

      Regards,  
      Rangeles Management
    `;

    try {
      await sendEmail(user, subject, message);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailErr) {
      console.error("❌ Failed to send welcome email:", emailErr);
    }

    res.status(201).json({
      message: "User registered successfully. A welcome email has been sent.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

// =========================
// 🔹 LOGIN USER
// =========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// =========================
// 🔹 FORGOT PASSWORD
// =========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetLink, user.fullName);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

// =========================
// 🔹 RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
