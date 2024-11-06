import mongoose from 'mongoose';
import AdminModel from '../model/adminModel.js'
import OrderDetails from '../model/orderDetailsModel.js'
import bcryt from 'bcrypt'
import { CustomError } from '../components/CustomError.js';

/**
 * Inside AdminService
 * // adminSignUp (sign up feature for admins)
 * // adminSignIn (sign in feature for admins)
 * // adminAcceptOrder (feature for admins to accept the placed orders)
 * // adminRejectOrder (feature for admins to reject the placed orders)
 */

export class AdminService {
    /**
    * 1. Checks for the adminDetails first (throws a custom error if the validation is not fullfilled!)
    * 2. Checks if the signup name is already inside the database or not (adminName compares adminDetails.adminName(req body), adminName(database))
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
            throw new CustomError("Account already exist!(conflict error) - backend", 409);
        }

        const hashPassword = await bcryt.hash(adminDetails.password, 10); // encrypt the password using bcryt

        const account = await AdminModel.create({ ...adminDetails, password: hashPassword }) // create an admin account with adminDetails(using admin model)

        if (!account) throw new CustomError("Account cannot be created! - backend", 500); // if the account cannot be created, throw an error

        // track the time of an account creation
        const timestamp = new Date().toLocaleString();

        return {
            account,
            signUpAt: timestamp
        };
    }

    /**
     * 1. Checks for the adminDetails first (throws a custom error if the validation goes wrong)
     * 2. Find the account by comparing the stored property adminName with the req.body property, adminName (if true, return the account details along with the password)
     * 3. If the account is not found while comparing the adminNames, throws a custom error
     * 4. Since the stored password is encrypted, while comparing the password, the req.body has to be hashed
     * 5. If the password is wrong, throws another custom error
     * 6. Added a timestamp to track the time of an account signIn
     * 7. Finally, return the signedIn account's details along with the timstamp
     */
    async adminSignIn(adminDetails) {//{adminDetails} as req.body
        try {
            if (!adminDetails || typeof adminDetails !== 'object') {
                throw new CustomError("All fields required! - backend", 400);
            }

            // have to use .select("+password") since, 'select:false' in database
            const account = await AdminModel.findOne({ adminName: adminDetails.adminName }).select("+password");
            if (!account) throw new CustomError("Account does not exist! - backend", 404);

            // compare passwords(enterPassword, storedPassword)
            const comparePassword = await bcryt.compare(adminDetails.password, account.password);
            if (!comparePassword) throw new CustomError("IncorrectPassword! - backend", 409);

            // track the time of an account signIn
            const timestamp = new Date().toLocaleString();

            return { ...adminDetails, signInAt: timestamp }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * 1. Validate the orderId first (throws a custom error if it goes wrong)
     * 2. Find and update the orderDetails using orderId, updates the default status with 'accepted'
     * 3. If the orderDetails is not found, throw a custom error
     * 4. Return the updated orderDetails
     */
    async adminAcceptOrder(orderId) {
        try {
            if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id - backend", 400);

            // track the time of the order acception
            const timestamp = new Date().toLocaleString();

            // It is more conveniet to use {new:true} instead of await order.save() when using .findbyIdAndUpdate
            const order = await OrderDetails.findByIdAndUpdate(orderId,
                {
                    status: 'accepted',
                    orderDispatchedTime: timestamp
                },
                { new: true } // Return the updated document
            );
            if (!order) throw new CustomError("Order not found!", 404);

            return order;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 1. Validates the orderId first (throws a custom error if it goes wrong)
     * 2. Find the orderDetails and delete it using orderId
     * 3. If the orderDetails is not found, throws a custom error
     * 4. Returns the deletion message if the orderDetails deletion is successfull
     */
    async adminRejectOrder(orderId) {
        try {
            if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id", 400);

            const order = await OrderDetails.findByIdAndDelete(orderId); // Directly deletes the orderDetails from the database using orderId
            if (!order) throw new CustomError("Order not found!", 404);

            return { message: "Order rejected successfully." }; // Returns only the deletion message without the deleted orderDetails
        } catch (error) {
            throw error;
        }
    }
}
