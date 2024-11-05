import mongoose from 'mongoose';
import AdminModel from '../model/adminModel.js'
import OrderDetails from '../model/orderDetailsModel.js'
import bcryt from 'bcrypt'
import { CustomError } from '../components/CustomError.js';

/**
 * Inside AdminService
 * // adminSignUp (sign up feature for admins)
 *
 * // adminsignIn (sign in feature for admins)
 */

export class AdminService {
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
            if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid Id", 400);

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

    async adminAcceptOrder(orderId) {
        try {
            if(!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id - backend", 400);

            const order = await OrderDetails.findByIdAndUpdate(orderId,
                { status: 'accepted' }, // Update the status
                { new: true } // Return the updated document
            );

            if (!order) throw new CustomError("Order not found!", 404);

            return order;
        } catch (error) {
            throw error;
        }
    }

    // method to reject order
    async adminRejectOrder(orderId) {
        try {
            if(!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id", 400);

            const order = await OrderDetails.findByIdAndDelete(orderId);
            if (!order) throw new CustomError("Order not found!", 404);

            return { message: "Order rejected successfully." };
        } catch (error) {
            throw error;
        }
    }
}
