import AdminModel from '../../model/usermodel/adminModel.js'
import ClientModel from '../../model/usermodel/clientModel.js';

export const fetchAdminDetails = async (req, res) => {
    const adminId = req.adminId;
    try {
        const adminDetails = await AdminModel.findById(adminId).select("+password");
        if (!adminDetails) return res.status(404).json({ message: "Admin not found! - backend" });

        return res.status(200).json({ adminDetails }); // can send the full adminDetails as well

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch admin details - backend" });
    }
}

export const fetchClientDetails = async (req, res) => {
    const clientId = req.clientId;

    try {
        const clientDetails = await ClientModel.findById(clientId);
        if (!clientDetails) return res.status(404).json({ message: "Client not found! - backend" });

        return res.status(200).json({ clientDetails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch client details - backend" });
    }
}
