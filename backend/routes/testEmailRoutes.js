// backend/routes/testRoutes.js
import express from "express";
import { updateOverdueTenants } from "../utils/updateOverdues.js";
import { sendEmail } from "../utils/sendEmails.js";
const router = express.Router();

// router.get("/test-email", async (req, res) => {
//   try {
//     await updateOverdueTenants();
//     res.status(200).json({ message: "✅ Overdue check executed successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "❌ Error running overdue check" });
//   }
// });
// // 

router.get("/send-test", async (req, res) => {
  try {
    const fakeTenant = {
      firstName: "Chinese",
      lastName: "Man",
      email: "toms212003@gmail.com" 
    };

    await sendEmail(fakeTenant,"Overdue Rent Notice",`Your rent for your unit is now overdue. Please settle your payment as soon as possible to avoid penalties.`);
    res.status(200).json({ message: "✅ Test email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Error sending test email" });
  }
});


export default router;
