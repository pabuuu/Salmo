import QR from "../models/QR.js"; 

export const getQrCodes = async (req, res) => {
  try {
    const qr = await QR.findOne();
    if (!qr) return res.status(404).json({ message: "QR codes not found" });

    const base = `${req.protocol}://${req.get("host")}`;

    res.json({
      gcash: qr.gcash.startsWith("http") ? qr.gcash : base + qr.gcash,
      bank: qr.bank.startsWith("http") ? qr.bank : base + qr.bank
    });
  } catch (err) {
    console.error("Error fetching QR codes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

