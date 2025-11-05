// backend/utils/sendEmails.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // ✅ Load .env from backend folder

// =========================
// Setup reusable transporter
// =========================
const { EMAIL_USER, EMAIL_PASS } = process.env;

console.log("📧 Initializing email transporter...");
console.log("EMAIL_USER:", EMAIL_USER || "❌ Missing");
console.log("EMAIL_PASS:", EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, // use Gmail App Password
  },
});

// ✅ Verify connection once
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Transporter verification failed:", error);
  } else {
    console.log("✅ Transporter verified and ready to send emails!");
  }
});

// =========================
// General tenant email
// =========================
export const sendEmail = async (tenant, subject, message) => {
  try {
    console.log(`📤 Sending general email to ${tenant.email}...`);

    const formattedBalance =
      tenant.balance !== undefined && tenant.balance !== null
        ? `₱${Number(tenant.balance).toLocaleString()}`
        : "Not specified";

    const mailOptions = {
      from: `"R Angeles Property Leasing" <${EMAIL_USER}>`,
      to: tenant.email,
      subject,
      html: `
        <div style="font-family: system-ui, sans-serif; font-size: 14px; color: #2c3e50;">
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px;">
            <h2 style="color: #1e40af;">R Angeles Property Leasing</h2>
            <p>Dear <strong>${tenant.firstName} ${tenant.lastName}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.5;">
              ${message}
            </p>

            ${
              tenant.balance !== undefined && tenant.balance !== null
                ? `
                <div style="margin: 15px 0; padding: 10px; background-color: #e0f2fe; border-left: 4px solid #1e40af; border-radius: 5px;">
                  <strong>Current Outstanding Balance:</strong>
                  <span style="font-size: 16px; color: #1e40af; font-weight: bold;">${formattedBalance}</span>
                </div>
                `
                : ""
            }

            <hr style="margin: 20px 0; border: none; border-top: 1px dashed lightgray;" />

            <h3 style="color: #1e40af; font-size: 16px;">Payment Information</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #374151;">
              <strong>GCash Account Name:</strong> R Angeles Property Leasing<br/>
              <strong>GCash Number:</strong> 09XX-XXX-4321<br/>
              <strong>Reference Format:</strong> [Your Full Name] - Rent Payment
            </p>

            <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
              This is an automated notice from <strong>R Angeles Property Leasing</strong>.<br/>
              Please contact us if you’ve already made your payment.
            </p>
            <div style="margin-top: 10px;">
              <a href="mailto:${EMAIL_USER}" style="color: #1e40af; text-decoration: none;">
                📧 Reply to this email
              </a>
            </div>
          </div>

          <p style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
            Sent on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${tenant.email}`);
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

// =========================
// Welcome / Password Setup Email
// =========================
export const sendPasswordResetEmail = async (email, resetLink, fullName) => {
  try {
    console.log(`📤 Sending password setup email to ${email}...`);

    const mailOptions = {
      from: `"R Angeles Property Leasing" <${EMAIL_USER}>`,
      to: email,
      subject: "Welcome! Set Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333;">
          <h2 style="color: #1e40af;">Welcome, ${fullName}!</h2>
          <p>You have been registered as an admin. Please click the button below to set your password:</p>
          <a href="${resetLink}" 
            style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin-top: 10px;">
            Set My Password
          </a>
          <p style="margin-top: 15px;">This link will expire in <strong>15 minutes</strong>.</p>
          <p>If you didn’t expect this email, you can safely ignore it.</p>
          <br/>
          <p style="font-size: 12px; color: #888;">Sent by R Angeles Property Leasing</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password setup email sent to ${email}`);
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
  } catch (error) {
    console.error("❌ Error sending password setup email:", error);
  }
};
