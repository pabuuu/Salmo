// backend/utils/updateOverdues.js
import Tenant from "../models/Tenants.js";
import { sendEmail } from "./sendEmails.js";

export const updateOverdueTenants = async () => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    console.log("🕒 Running updateOverdueTenants...");

    // 🔁 1. Refresh next period for fully paid tenants whose due date has arrived
    const tenantsToRefresh = await Tenant.find({
      nextDueDate: { $lte: today },
      status: "Paid",
      isArchived: false,
    }).populate("unitId", "rentAmount paymentFrequency");

    for (const tenant of tenantsToRefresh) {
      const rentAmount = tenant.unitId?.rentAmount || 0;

      tenant.balance = rentAmount;
      tenant.status = "Unpaid";

      const nextDue = new Date(tenant.nextDueDate);
      if (tenant.unitId?.paymentFrequency === "Quarterly") {
        nextDue.setMonth(nextDue.getMonth() + 3);
      } else if (tenant.unitId?.paymentFrequency === "Yearly") {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      } else {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      tenant.nextDueDate = nextDue;
      await tenant.save();

      console.log(`🔄 Refreshed rent for ${tenant.firstName} ${tenant.lastName}`);
    }

    // 🚨 2. Mark overdue tenants (only Pending/Unpaid, not Partial)
    const overdueTenants = await Tenant.find({
      nextDueDate: { $lt: today },
      status: { $in: ["Pending", "Unpaid"] }, // <-- partial tenants are safe
      isArchived: false,
    });

    if (overdueTenants.length > 0) {
      await Promise.all(
        overdueTenants.map((t) => Tenant.findByIdAndUpdate(t._id, { status: "Overdue" }))
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

    // 📅 3. Rent due today reminders
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

    // 📆 4. Upcoming (next week) reminders
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

    console.log("✅ Overdue, reminders, and rent refresh check complete.");
  } catch (err) {
    console.error("❌ Error updating overdue tenants:", err);
  }
};
