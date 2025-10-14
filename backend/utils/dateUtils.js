/**
 * Calculate the next due date based on a start date and payment frequency
 * @param {Date} fromDate - Starting date
 * @param {string} frequency - "Monthly", "Quarterly", or "Yearly"
 * @returns {Date} next due date
 */
export const getNextDueDate = (fromDate, frequency) => {
    const next = new Date(fromDate);
    if (frequency === "Monthly") next.setMonth(next.getMonth() + 1);
    else if (frequency === "Quarterly") next.setMonth(next.getMonth() + 3);
    else if (frequency === "Yearly") next.setFullYear(next.getFullYear() + 1);
    return next;
  };
  