import AdminModel from '../model/adminModel.js'
import ClientModel from '../model/clientModel.js';
import jwt from 'jsonwebtoken'

export const fetchAdminDetails = async (req, res) => {
    const authHeader = req.headers['authorization']; // or use req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json("Invalid token! - backend", 401);

    try {
        const isValidToken = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = isValidToken.adminId;
        console.log("ClientId-->", adminId);

        req.admin = isValidToken;
        console.log("AdminId from fetchAdminDetails --->", req.admin);

        const adminDetails = await AdminModel.findById(adminId);
        if (!adminDetails) return res.status(404).json({ message: "Admin not found! - backend" });

        return res.status(200).json({ adminDetails: adminDetails.name }); // can send the full adminDetails as well

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch admin details - backend" });
    }
}

export const fetchClientDetails = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Invalid token - backend" });
    try {
        const isValidToken = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = isValidToken.clientId;

        const clientDetails = await ClientModel.findById(clientId);
        if (!clientDetails) return res.status(404).json({ message: "Client not found! 0 backend" });

        return res.status(200).json({ clientDetails });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch client details - backend" });
    }
}
