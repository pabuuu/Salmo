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
export const create = async (req, res) => { // load all
    try {
        res.json({ success: true, message: "Tenants creation successful"});
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//delete

//update

