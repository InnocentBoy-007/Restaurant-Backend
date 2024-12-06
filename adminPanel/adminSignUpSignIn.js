import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";
import jwt from 'jsonwebtoken'
import AdminModel from '../model/adminModel.js'

const adminService = new AdminService(); // Creating an instance of AdminService class

// Controller functions (standalone functions)
// (test passed)
export const adminSignUp = async (req, res) => {
    const { adminDetails } = req.body;
    try {
        const response = await adminService.adminSignUp(adminDetails); // Calling the instance method, adminSignUp

        return res.status(201).json(response);
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


// logout - test passed
export const adminLogOut = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    if (!token) throw new CustomError("Invalid token - backend", 401);
    try {
        const verification = jwt.verify(token, process.env.JWT_SECRET); // verifying the admin logout process using the primary token
        if (!verification) return res.status(409).json({ message: "Incorrect token" });

        const response = await adminService.adminLogOut(token);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
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
    const adminId = req.adminId;
    try {
        await adminService.deleteAdmin(adminId);
        return res.status(200).json({ message: "Admin deleted successfully! - backend" });
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const updateAdmin = async (req, res) => {
    const adminId = req.adminId;
    const { adminDetails } = req.body;
    try {
        const response = await adminService.updateAdmin(adminId, adminDetails);
        return res.status(201).json({ message: "Admin profile updated successfully! - backend", response });
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
