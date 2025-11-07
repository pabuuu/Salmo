import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { supabase } from "../supabase.js";

dotenv.config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Email helper
const sendEmailDirect = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"Rangeles Management" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get users by role
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

// Register user (Admin/Staff)
// Register user (Admin/Staff)
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, role = "admin", contactNumber } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    let validIdUrl, resumeUrl;

    // Upload Valid ID
    if (req.files?.validId?.[0]) {
      const file = req.files.validId[0];
      const fileName = `validIds/${Date.now()}_${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("users")
        .upload(fileName, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      validIdUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.path}`;
    }

    // Upload Resume
    if (req.files?.resume?.[0]) {
      const file = req.files.resume[0];
      const fileName = `resumes/${Date.now()}_${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("users")
        .upload(fileName, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      resumeUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.path}`;
    }

    // Generate a temporary password
    const tempPassword = `${fullName.split(" ")[0]}${contactNumber.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user in DB — always set isTemporaryPassword: true
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      isTemporaryPassword: true, // ✅ ensure true
      validId: validIdUrl || undefined,
      resume: resumeUrl || undefined,
    });

    await user.save();

    // Generate setup token & link
    const setupToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    const frontendUrl = process.env.FRONTEND_URL || "https://rangeles.online";
    const setupLink = `${frontendUrl}/new-password?token=${setupToken}`;

    // Send welcome email
    const subject = `Welcome to Rangeles Admin Portal`;
    const message = `
Hello ${fullName},

You have been registered as a ${role.toUpperCase()} in the Rangeles Admin Portal.

📧 Login Email: ${email}
🔑 Temporary Password: ${tempPassword}

Please log in using your temporary password and set a new one here:
${setupLink}

Regards,
Rangeles Management
`;

    await sendEmailDirect(email, subject, message);

    res.status(201).json({
      success: true,
      message: "User registered successfully. A welcome email with setup instructions has been sent.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${
      process.env.FRONTEND_URL || "https://rangeles.online"
    }/reset-password?token=${resetToken}`;

    const subject = "Password Reset Request";
    const message = `
Hello ${user.fullName},

You requested a password reset. Click the link below to reset your password:
${resetLink}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.

Regards,
Rangeles Management
    `;

    await sendEmailDirect(email, subject, message);

    console.log(`📩 Password reset link sent to ${email}: ${resetLink}`);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Failed to send password reset email" });
  }
};

// Reset Password
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
