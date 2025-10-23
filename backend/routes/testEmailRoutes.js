// backend/routes/testRoutes.js
import express from "express";
import { updateOverdueTenants } from "../utils/updateOverdues.js";
import { sendEmail } from "../utils/sendEmails.js";
const router = express.Router();

// router.get("/test-email", async (req, res) => {
//   try {
//     await updateOverdueTenants();
//     res.status(200).json({ message: "Overdue check executed successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error running overdue check" });
//   }
// });
// // 

router.get("/send-test", async (req, res) => {
  try {
    const fakeTenant = {
      firstName: "John",
      lastName: "Doe",
      email: "toms212003@gmail.com",
    };

    const message = `
      <p>Your rent for your unit is now <strong>overdue</strong>. Please settle your payment as soon as possible to avoid penalties.</p>

      <h3 style="color: #1e40af; font-size: 16px; margin-top: 12px;">Payment Information (Test)</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #374151;">
        <strong>GCash Account Name:</strong> R Angeles Property Leasing<br/>
        <strong>GCash Number:</strong> 09XX-XXX-4321<br/>
        <strong>Reference Format:</strong> [Your Full Name] - Rent Payment
      </p>
      <a href="https://drive.google.com/uc?export=view&id=18xwW2J83n_DfYYG4-pMvSiS3P0xwopIp" target="_blank">
        <img
          src="https://drive.google.com/uc?export=view&id=18xwW2J83n_DfYYG4-pMvSiS3P0xwopIp"
          alt="GCash QR Code"
          style="width:320px; border-radius:12px; margin-top:12px;"
        />
      </a>
      <p style="font-size: 13px; color: #6b7280; margin-top: 12px;">
        <em>Please verify the payment details before sending any funds. This is a test payment block for mail testing only.</em>
      </p>
    `;

    await sendEmail(fakeTenant, "Overdue Rent Notice", message);

    res.status(200).json({ message: "New Test email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error sending test email" });
  }
});

export default router;
