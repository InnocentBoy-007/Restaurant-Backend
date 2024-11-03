import AdminModel from '../model/adminModel.js'

class AdminService {
    async adminSignUp(adminDetails) {
        if(!adminDetails || typeof adminDetails !== 'object') {
            throw new Error("All fields required! - backend");
        }

        //check if there's any duplicate account in the database
        const isDuplicate = await AdminModel.findOne({adminName:adminDetails.adminName});
        if(isDuplicate) {
            throw {message:"Account already exist", errorCode:409}
        }

        // create an admin account with adminDetails
        const account = await AdminModel.create(adminDetails)
        // if the account cannot be created, throw an error
        if(!account) {
            throw {message:"Account cannot be created! - backend", errorCode:500}
        }

        return account;
    }
}

export const adminSignUp = async(req, res) => {
    const {adminDetails} = req.body;
    const adminService = new AdminService();
    try {
        const response = await adminService.adminSignUp(adminDetails);

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
