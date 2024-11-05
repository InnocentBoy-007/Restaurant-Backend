import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";

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
