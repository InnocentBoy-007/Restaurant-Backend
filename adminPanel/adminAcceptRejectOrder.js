import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";

export const acceptOrder = async (req, res) => {
    const { id } = req.params;
    const adminService = new AdminService();
    try {
        const response = await adminService.adminAcceptOrder(id);
        // show the client about the dispatch time
        const timestamp = new Date().toLocaleString();

        // return the response along with the order time and the dispatched time
        return res.status(200).json({
            message: "Order has been dispatched! - backend",
            response,
            dispatchTime: timestamp
        })
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error - backend" })
    }
}

export const rejectOrder = async(req, res) => {
    const {id} = req.params;
    const adminService = new AdminService();
    try {
        const response = await adminService.adminRejectOrder(id);
        return res.status(200).json({
            message:"Order rejected! - backend",
            response
        })
    } catch (error) {
        if(error instanceof CustomError) {
            res.status(error.errorCode).json({message:error.message})
        }
        res.status(500).json({message:"Internal server error! - backend"})
    }
}
