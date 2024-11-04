import mongoose from 'mongoose';
import AdminModel from '../model/adminModel.js'
import bcryt from 'bcrypt'

class CustomError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}

/**
 * Inside AdminService
 * // adminSignUp (sign up feature for admins)
 *
 * // adminsignIn (sign in feature for admins)
 */

class AdminService {
    /**
    * 1. Checks for the adminDetails first (throws a custom error if the validation is not fullfilled!)
    * 2. Checks if the signup name is already inside the database or not (adminName compares adminDetails.adminName, adminName(database) - adminDetails.adminName(req body))
    * 3. If there isn't any duplicate account, hash the password provided from the req body using bcryt
    * 4. Create an account using the provided req body and the hashed password
    * 5. Throw a custom error if an account cannot be created (throw custom error if cannot signup)
    * 6. Create a new timestamp (tracking the date & time of account creation (signup date & time))
    * 7. return the details of the created account
    */
    async adminSignUp(adminDetails) { // adminDetails is a req body
        if (!adminDetails || typeof adminDetails !== 'object') {
            throw new CustomError("All fields required!(Bad Request) - backend", 400); // throws a custom error in case the req body is not provided fully or the provided req body is not an object
        }

        const isDuplicate = await AdminModel.findOne({ adminName: adminDetails.adminName }); //check if there's any duplicate account in the database
        if (isDuplicate) {
            throw new CustomError("Account already exist!(conflict error) - backend0", 409);
        }

        const hashPassword = await bcryt.hash(adminDetails.password, 10); // encrypt the password using bcryt

        const account = await AdminModel.create({ // create an admin account with adminDetails(using admin model)
            ...adminDetails,
            password: hashPassword
        })

        if (!account) { // if the account cannot be created, throw an error
            throw new CustomError("Account cannot be created! - backend", 500);
        }

        // track the time of an account creation
        const timestamp = new Date().toLocaleString();

        return {
            account,
            signUpAt: timestamp
        };
    }

    // change the throw error later with custom error
    async adminSignIn(id, adminDetails) {
        try {
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                throw new CustomError("Invalid Id", 400);
            }
            if (!adminDetails || typeof adminDetails !== 'object') {
                throw new CustomError("All fields required! - backend", 400);
            }

            // have to use .select("+password") since, 'select:false' in database
            const account = await AdminModel.findById(id).select("+password");
            if (!account) {
                throw new CustomError("Account does not exist! - backend", 404);
            }

            // compare passwords(enterPassword, storedPassword)
            const comparePassword = await bcryt.compare(adminDetails.password, account.password);

            if (!comparePassword) {
                throw new CustomError("IncorrectPassword! - backend", 409);
            }

            // track the time of an account login
            const timestamp = new Date().toLocaleString();

            return {
                ...adminDetails,
                signInAt: timestamp
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

// Controller functions (standalone functions)

export const adminSignUp = async (req, res) => {
    const { adminDetails } = req.body;
    const adminService = new AdminService(); // Creating an instance of AdminService class
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
    const { id } = req.params;
    const { adminDetails } = req.body;
    const adminService = new AdminService();
    try {
        const response = await adminService.adminSignIn(id, adminDetails);

        return res.status(200).json({ message: "Sign in successfully! - backend", response })
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}
