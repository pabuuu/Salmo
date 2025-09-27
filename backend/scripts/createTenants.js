//THIS IS FOR TESTING ONLYYY BRO
import mongoose from "mongoose";
import dotenv from "dotenv";
import Tenants from "../models/Tenants.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

    const createTenant = async () => {
        try {
            const firstName = "John Smith";
            const lastName = "Doe";
            const email = "JohnSmith@gmail.com";
            const contactNumber = '09123123123';
            const rentalNo = 1;
            const rentalUnit = 'A';
            const rentalAmount = 600000;

            //check if exists
            const existing = await Tenants.findOne({ email });
            if (existing) {
                console.log("Tenant already exists");
                process.exit(0);
            }
            //create
            const tenant = new Tenants({
                firstName,
                lastName,
                email,
                contactNumber,
                rentalNo,
                rentalUnit,
                rentalAmount,
              });

            await tenant.save();
            console.log("Tenant created successfully");
            process.exit(0);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    };

createTenant();
