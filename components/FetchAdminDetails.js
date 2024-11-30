import AdminModel from '../model/adminModel.js'
import jwt from 'jsonwebtoken'

export const fetchAdminDetails = async (req, res) => {
    const authHeader = req.headers['authorization']; // or use req.headers.authorization
    if (!authHeader) return res.status(400).json({ message: "Invalid header - backend" });

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

        return res.status(200).json({ adminDetails: adminDetails.name });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch admin details - backend" });
    }
}
