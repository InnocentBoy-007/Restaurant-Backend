import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";

const adminService = new AdminService();

// acceptOrder(test successfull)
export const acceptOrder = async (req, res) => {
    const { orderId, admin } = req.params;
    try {
        const response = await adminService.adminAcceptOrder(orderId, admin);
        // show the client about the dispatch time
        const timestamp = new Date().toLocaleString();

        // return the response along with the order time and the dispatched time
        return res.status(200).json({
            message: "Order has been dispatched! - backend",
            response,
        })
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
    const { adminName } = req.params;
    try {
        const response = await adminService.fetchOrderDetails(adminName);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message })

    }
}
