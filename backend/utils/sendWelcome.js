// backend/utils/sendWelcome.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); 

const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in environment variables!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, 
  },
});

transporter.verify((err, success) => {
  if (err) console.error("❌ Transporter verification failed:", err);
  else console.log("✅ Transporter verified and ready to send emails!");
});

export const sendWelcomeEmail = async (tenant,unit) => {
  try {
    const mailOptions = {
      from: `"R. Angeles Property" <${EMAIL_USER}>`,
      to: tenant.email,
      subject: "Welcome to R. Angeles Property Leasing!",
      html: `
        <p>Dear ${tenant.firstName} ${tenant.lastName},</p>
        <p>Welcome! Your account has been created successfully.</p>
        <p>Located at: ${unit.unitNo} | ${unit.location}</p>
        <p>Thank you for choosing R. Angeles Property Leasing.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending welcome email:", err);
  }
};
