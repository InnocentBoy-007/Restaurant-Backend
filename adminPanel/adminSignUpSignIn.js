import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";

const adminService = new AdminService(); // Creating an instance of AdminService class

// Controller functions (standalone functions)
// (test passed)
export const adminSignUp = async (req, res) => {
    const { adminDetails } = req.body;
    try {
        const response = await adminService.adminSignUp(adminDetails); // Calling the instance method, adminSignUp

        return res.status(201).json({ message: "Please enter the OTP to complete the signup process - backend", response })
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const adminVerification = async (req, res) => {
    const { otp } = req.body;
    try {
        const response = await adminService.adminVerification(otp);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const adminSignIn = async (req, res) => {
    const { adminDetails } = req.body;
    try {
        const response = await adminService.adminSignIn(adminDetails);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const fetchAdmins = async (req, res) => {
    try {
        const response = await adminService.fetchAdmins();
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const deleteAdmin = async (req, res) => {
    const { adminId } = req.param
    try {
        await adminService.deleteAdmin(adminId);
        return res.status(200).json({ messag: "Admin deleted successfully! - backend" });
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const updateAdmin = async (req, res) => {
    const { adminId } = req.params;
    const { adminDetails } = req.body;
    try {
        const response = await adminService.updateAdmin(adminId, adminDetails);
        return res.status(201).json({ message: "Admin profile updated successfully! - backend", response });
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
