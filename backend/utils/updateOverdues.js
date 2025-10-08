import Tenant from "../models/Tenants.js";

export const updateOverdueTenants = async () => {
  try {
    const today = new Date();

    const overdueTenants = await Tenant.find({
      nextDueDate: { $lt: today },
      status: { $ne: "Overdue" },
      isArchived: false,
    });

    if (overdueTenants.length === 0) return;

    const updates = overdueTenants.map((tenant) =>
      Tenant.findByIdAndUpdate(tenant._id, { status: "Overdue" })
    );

    await Promise.all(updates);
    console.log(`Updated ${overdueTenants.length} tenants to Overdue status.`);
  } catch (err) {
    console.error("Error updating overdue tenants:", err);
  }
};
