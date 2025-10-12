// backend/utils/updateOverdues.js
import Tenant from "../models/Tenants.js";
import { sendEmail } from "./sendEmails.js";

export const updateOverdueTenants = async () => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    //mark overdue tenants
    const overdueTenants = await Tenant.find({
      nextDueDate: { $lt: today },
      status: { $ne: "Overdue" },
      isArchived: false,
    });

    if (overdueTenants.length > 0) {
      await Promise.all(
        overdueTenants.map((t) =>
          Tenant.findByIdAndUpdate(t._id, { status: "Overdue" })
        )
      );

      for (const tenant of overdueTenants) {
        if (tenant.email) {
          await sendEmail(
            tenant,
            "Overdue Rent Notice",
            `Dear ${tenant.firstName}, your rent for your unit is now overdue. Please settle your payment as soon as possible to avoid penalties.`
          );
        }
      }
      console.log(`🚨 Marked ${overdueTenants.length} tenants as Overdue.`);
    }

    //jew today
    const dueToday = await Tenant.find({
      nextDueDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
      isArchived: false,
    });

    for (const tenant of dueToday) {
      if (tenant.email) {
        await sendEmail(
          tenant,
          "Rent Due Today",
          `Hi ${tenant.firstName}, this is a friendly reminder that your rent for your unit is due today.`
        );
      }
    }

    //due one week
    const dueNextWeek = await Tenant.find({
      nextDueDate: {
        $gte: new Date(nextWeek.setHours(0, 0, 0, 0)),
        $lt: new Date(nextWeek.setHours(23, 59, 59, 999)),
      },
      isArchived: false,
    });

    for (const tenant of dueNextWeek) {
      if (tenant.email) {
        await sendEmail(
          tenant,
          "Upcoming Rent Due",
          `Hello ${tenant.firstName}, your rent for your unit is due in one week (${tenant.nextDueDate.toDateString()}).`
        );
      }
    }

    console.log("✅ Overdue & reminder email check complete.");
  } catch (err) {
    console.error("❌ Error updating overdue tenants:", err);
  }
};
