// backend/scripts/testEmail.js
import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";

console.log("📌 Starting test email script...");

// ✅ Load the .env from backend root
dotenv.config({ path: path.resolve("./.env") });

console.log("EMAIL_USER from .env:", process.env.EMAIL_USER || "undefined");
console.log("EMAIL_PASS from .env:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  const testRecipient = "gian.karlo.reyess@gmail.com";
  console.log("📧 Attempting to send email to:", testRecipient);

  try {
    // Verify connection
    await transporter.verify();
    console.log("✅ Transporter verified successfully");

    const info = await transporter.sendMail({
      from: `"Salmo Test" <${process.env.EMAIL_USER}>`,
      to: testRecipient,
      subject: "✅ Test Email from Salmo Backend",
      text: "This is a test email sent from your Nodemailer setup.",
    });

    console.log("✅ Test email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
}

main();
