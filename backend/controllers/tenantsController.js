import Tenants from '../models/Tenants.js'

export const load = async (req, res) => { // load all
    try {
        const tenants = await Tenants.find(); //fetch
        res.json({ success: true,data:tenants, message: "Tenants loading successful"});
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//create
export const create = async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        rentalUnit,
        rentalAmount,
        paymentFrequency,
        location,
      } = req.body;
  
      // validate 
      if (!firstName || !lastName || !email) {
        return res
          .status(400)
          .json({ success: false, message: "First name, last name, and email are required" });
      }
  
      // check duplicate emal
      const existing = await Tenants.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Tenant already exists" });
      }
  
      const tenant = new Tenants({
        firstName,
        lastName,
        email,
        contactNumber,
        rentalUnit,
        rentalAmount,
        paymentFrequency,
        location,
      });
  
      await tenant.save();
  
      res.status(201).json({
        success: true,
        message: "Tenant created successfully",
        tenant,
      });
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: errors.join(", ") });
      }
      res.status(500).json({ success: false, message: err.message });
    }
};
  

//delete

//update

