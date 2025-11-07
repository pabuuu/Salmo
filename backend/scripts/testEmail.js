// backend/scripts/testEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

console.log("📌 Starting test email script...");

// ✅ Resolve backend directory (works even if run from root or another folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

// ✅ Load environment variables from backend/.env
dotenv.config({ path: envPath });

console.log(`🧭 Loaded .env from: ${envPath}`);
console.log(`EMAIL_USER from .env: ${process.env.EMAIL_USER || "undefined"}`);
console.log(
  `EMAIL_PASS from .env: ${process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing"}`
);

// ✅ Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestEmail() {
  const recipient = "gian.karlo.reyess@gmail.com"; // change if needed
  console.log(`📧 Attempting to send email to: ${recipient}`);

  try {
    await transporter.verify();
    console.log("✅ Transporter verified successfully");

    const info = await transporter.sendMail({
      from: `"RA Property Leasing" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: "📬 Test Email from RA Property Leasing",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Test Successful!</h2>
          <p>Hello!</p>
          <p>This is a test email to confirm that your <b>Nodemailer</b> setup is working properly.</p>
          <hr/>
          <p style="font-size: 12px; color: #555;">RA Property Leasing Backend • ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log(`📨 Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

sendTestEmail();
