import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";
import jwt from 'jsonwebtoken'

const adminService = new AdminService();

// acceptOrder(test successfull)
export const acceptOrder = async (req, res) => {
    const adminId = req.adminId;
    const { orderId } = req.params;
    try {
        const response = await adminService.adminAcceptOrder(orderId, adminId);

        // return the response along with the order time and the dispatched time
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const rejectOrder = async (req, res) => {
    const adminId = req.adminId;
    const { orderId } = req.params;
    try {
        const response = await adminService.adminRejectOrder(orderId, adminId);

        return res.status(200).json(response)
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const fetchOrders = async (req, res) => {
    const adminId = req.adminId; // adminId from refreshToken

    try {
        const response = await adminService.fetchOrderDetails(adminId);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message })

    }
}
