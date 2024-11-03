import AdminModel from '../model/adminModel.js'

class AdminService {
    async adminSignUp(adminDetails) {
        if(!adminDetails) {
            throw new Error("All fields required! - backend");
        }

        const response = await AdminModel.create(adminDetails)
        return response;
    }
}

export const adminSignUp = async(req, res) => {
    const {adminDetails} = req.body;
    const adminService = new AdminService();
    try {
        const response = await adminService.adminSignUp(adminDetails);
        if(!response) return res.status(400).json({
            message:"Cannot signup! - backend"
        })

        const adminCheck = await AdminModel.findOne({adminName:response.adminName});
        if(!adminCheck) {
            console.log("Admin not created! - backend");
            return res.status(400).json({
                message:"Admin not found after creation! - backend"
            })
        } else {
            console.log("Admin found! - backend");
        }

        return res.status(201).json({
            message:"Signup successfully! - backend",
            response
        })
    } catch (error) {
        res.status(error.errorCode || 500).json({
            message:error.message || "Internal server error!"
        })
    }
}
