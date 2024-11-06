import { AdminService } from "../services/adminService.js";
import { CustomError } from "../components/CustomError.js";

const adminService = new AdminService(); // Creating an instance of AdminService class

// Controller functions (standalone functions)
export const adminSignUp = async (req, res) => {
    const { adminDetails } = req.body;
    try {
        const response = await adminService.adminSignUp(adminDetails); // Calling the instance method, adminSignUp

        return res.status(201).json({ message: "Signup successfully! - backend", response })
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message })
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}

export const adminSignIn = async (req, res) => {
    const { adminDetails } = req.body;
    try {
        const response = await adminService.adminSignIn(adminDetails);

        return res.status(200).json({ message: "Sign in successfully! - backend", response })
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}
