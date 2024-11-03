import mongoose from 'mongoose';
import AdminModel from '../model/adminModel.js'
import bcryt from 'bcrypt'

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

        // encrypted the password
        const hashPassword = await bcryt.hash(adminDetails.password, 10);

        // create an admin account with adminDetails
        const account = await AdminModel.create({
            ...adminDetails,
            password:hashPassword
        })
        // if the account cannot be created, throw an error
        if(!account) {
            throw {message:"Account cannot be created! - backend", errorCode:500}
        }

        // track the time of an account creation
        const timestamp = new Date().toLocaleString();

        return {
            account,
            signUpAt:timestamp
        };
    }

    async adminSignIn(id, adminDetails) {
        try {
            if(!id || !mongoose.Types.ObjectId.isValid(id)) {
                throw{message:"Invalid id - backend", errorCode:400};
            }
            if(!adminDetails || typeof adminDetails !== 'object') {
                throw{message:"All fields required! - backend", errorCode:400};
            }

            // have to use .select("+password") since, 'select:false' in database
            const account = await AdminModel.findById(id).select("+password");
            if(!account) {
                throw {message:"Account does not exist! - backend", errorCode:404};
            }

            // compare passwords(enterPassword, storedPassword)
            const comparePassword = await bcryt.compare(adminDetails.password, account.password);

            if(!comparePassword) {
                throw {message:"Incorrect password! - backend", errorCode:409}
            }

            // track the time of an account login
            const timestamp = new Date().toLocaleString();

            return {
                ...adminDetails,
                signInAt:timestamp
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
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

export const adminSignIn = async(req, res) => {
    const {id} = req.params;
    const {adminDetails} = req.body;
    const adminService = new AdminService();
    try {
        const response = await adminService.adminSignIn(id, adminDetails);

        return res.status(200).json({
            message:"Sign in successfully! - backend",
            response
        })
    } catch (error) {
        res.status(error.errorCode || 500).json({
            message:error.message || "Internal server error! - backend"
        })
    }
}
