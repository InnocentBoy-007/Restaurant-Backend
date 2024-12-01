import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";
import jwt from 'jsonwebtoken'

const adminService = new AdminService();

// acceptOrder(test successfull)
export const acceptOrder = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if (!token || token === null) throw new CustomError("Invalid token! - backend", 401);

    const { orderId, productId } = req.params;
    try {
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        const adminId = verifyToken.adminId;

        const response = await adminService.adminAcceptOrder(orderId, productId, adminId);

        // return the response along with the order time and the dispatched time
        return res.status(200).json({ message: "Order has been dispatched! - backend", response })
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const rejectOrder = async (req, res) => {
    const { orderId, admin } = req.params;
    try {
        const response = await adminService.adminRejectOrder(orderId, admin);
        return res.status(200).json({ response })
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const fetchOrders = async (req, res) => {
    const { adminId } = req.params; // adminId from refreshToken

    try {
        const response = await adminService.fetchOrderDetails(adminId);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message })

    }
}
