import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Tenants from "../models/Tenants.js"
import dotenv from "dotenv";

dotenv.config();

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const tenant = await Tenants.findOne({ email });
    if (!tenant) return res.status(404).json({ success: false, message: "Email not found." });

    const token = crypto.randomBytes(32).toString("hex");
    tenant.resetToken = token;
    tenant.resetTokenExpires = Date.now() + 10 * 60 * 1000; 
    await tenant.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `https://rangeles.online/reset-password-tenant?token=${token}`;


    const html = `
      <p>Hello ${tenant.firstName},</p>
      <p>You requested a password reset. Click the link below to create a new password. The link is valid for 10 minutes.</p>
      <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `;

    await transporter.sendMail({
      from: `"Rangeles Apartments" <${process.env.EMAIL_USER}>`,
      to: tenant.email,
      subject: "Password Reset Request",
      html,
    });

    return res.json({ success: true, message: "Password reset email sent." });
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "Token and newPassword are required." });

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.",
      });
    }

    const tenant = await Tenants.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!tenant) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    tenant.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields and also reset loginAttempts/lockUntil
    tenant.resetToken = undefined;
    tenant.resetTokenExpires = undefined;
    tenant.loginAttempts = 0;
    tenant.lockUntil = null;

    await tenant.save();

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
