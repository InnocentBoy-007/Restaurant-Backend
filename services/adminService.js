import mongoose from 'mongoose';
import AdminModel from '../model/adminModel.js'
import OrderDetails from '../model/orderDetailsModel.js'
import bcrypt from 'bcrypt'
import { CustomError } from '../components/CustomError.js';
import { SentMail } from '../components/SentMail.js';
import jwt from 'jsonwebtoken'
import Products from '../model/productModel.js'

/**
 * Inside AdminService
 * // adminSignUp (sign up feature for admins)
 * // adminSignIn (sign in feature for admins)
 * // adminAcceptOrder (feature for admins to accept the placed orders)
 * // adminRejectOrder (feature for admins to reject the placed orders)
 */

export class AdminService {
    constructor() {
        this.adminDetails = null; // creating an instance variable so that it is avaible to all the methods
        this.otp = null;
        this.mailer = new SentMail();
    }

    async generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '15m' });
    }

    // (test passed)
    async adminSignUp(adminDetails) { // adminDetails is a req body
        if (!adminDetails || typeof adminDetails !== 'object') {
            throw new CustomError("All fields required!(Bad Request) - backend", 400); // throws a custom error in case the req body is not provided fully or the provided req body is not an object
        }

        /**
         * use this if you want to validate specific request fields
         * const { adminName, adminEmail } = adminDetails;

        if (!adminName || typeof adminName !== 'string' || adminName.trim() === '') {
            throw new CustomError("adminName is required and must be a non-empty string!", 400);
        }
        if (!adminEmail || typeof adminEmail !== 'string' || adminEmail.trim() === '') {
            throw new CustomError("adminEmail is required and must be a non-empty string!", 400);
        }
         */

        try {
            const isDuplicateName = await AdminModel.findOne({ adminName: adminDetails.adminName }); //check if there's any duplicate account in the database
            if (isDuplicateName) throw new CustomError("Account already exist!(conflict error) - backend", 409);
            const isDuplicateEmail = await AdminModel.findOne({ adminEmail: adminDetails.adminEmail }); //check if there's any duplicate account in the database
            if (isDuplicateEmail) throw new CustomError("Account already exist!(conflict error) - backend", 409);

            this.adminDetails = adminDetails; // assigning all the req bodies to the instance variable

            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate otp
            this.otp = generateOTP;

            const receiverInfo = { // (object)
                to: adminDetails.adminEmail,
                subject: "OTP confirmation",
                text: `Use this OTP for the signup process ${this.otp}. Thanks from Innocent Team.`
            }
            await this.mailer.setUp();
            await this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text); // otp will be sent to the registered email address

            return { message: `OTP is sent to ${adminDetails.adminEmail}` }; // for testing
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in!", 500);
        }
    }

    // (test passed)
    async adminVerification(otp) {
        if (!otp) throw new CustomError("Invalid otp - backend", 400);
        try {
            if (otp !== this.otp) throw new CustomError("Wrong otp", 409);
            const hashPassword = await bcrypt.hash(this.adminDetails.password, 10); // encrypt the password using bcryt

            const account = await AdminModel.create({ ...this.adminDetails, password: hashPassword }) // create an admin account with adminDetails(using admin model)
            if (!account) throw new CustomError("Account cannot be created! - backend", 500); // if the account cannot be created, throw an error

            // track the time of an account creation
            const timestamp = new Date().toLocaleString();

            const receiverInfo = {
                to: this.adminDetails.adminEmail,
                subject: "Successfull sign up!",
                text: `Thanks ${this.adminDetails.adminName} for choosing Innocent Restaurant. From Innocent Team.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text);

            // Generate JWT after successful signup
            const token = await this.generateToken({ adminName: account.adminName }); // using the adminName as the  token for authorization
            console.log("Token--->", token);

            return { message: "Account sign up successfull! - backend", verification: `Verified on ${timestamp}`, token };
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while verifying an OTP - backend", 500);
        }
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
        if (!adminDetails || typeof adminDetails !== 'object') {
            throw new CustomError("All fields required! - backend", 400);
        }
        try {
            // have to use .select("+password") since, 'select:false' in database
            const account = await AdminModel.findOne({ adminEmail: adminDetails.adminEmail }).select("+password");
            if (!account) throw new CustomError("Account does not exist! - backend", 404);

            // compare passwords(enterPassword, storedPassword)
            const comparePassword = await bcrypt.compare(adminDetails.password, account.password);
            if (!comparePassword) throw new CustomError("IncorrectPassword! - backend", 409);

            // track the time of an account signIn
            const timestamp = new Date().toLocaleString();

            const message = `Signed in successfull, ${account.adminName}.`

            const token = await this.generateToken({ adminName: account.adminName }); // using the adminName as the token for authorization

            return { message, signInAt: timestamp, token };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in - backend", 500);
        }
    }

    async adminLogOut(adminToken) {
        if (!adminToken) throw new CustomError("Invalid token - backend", 400);
        try {
            return { message: "Logout successfully! - backend" };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to logout! - backend", 500);
        }
    }

    async fetchAdmins() {
        try {
            const admins = await AdminModel.find();
            if (admins.length === 0) throw new CustomError("No admins found! - backend", 404);
            return admins;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to fetch admin details! - backend", 500);
        }
    }

    async deleteAdmin(adminId) {
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) throw new CustomError("Invalid id - backend", 400);
        try {
            const checkAdminId = await AdminModel.findByIdAndDelete(adminId);
            if (!checkAdminId) throw new CustomError("Admin not found! - backend", 404);

            return { message: "Admin deleted successfully! - backend" };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while deleting an admin! - backend", 500);
        }
    }

    async updateAdmin(adminId, adminDetails) {
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) throw new CustomError("Invalid id - backend", 400);
        if (!adminDetails || typeof adminDetails !== 'object') throw new CustomError("All fields required/the request body should be a JSON structure - backend", 400);
        try {
            const update = await AdminModel.findByIdAndUpdate(adminId, adminDetails, { new: true });
            if (!update) throw new CustomError("Admin not found to be updated! - backend", 404);

            return { message: "Admin updated successfully!", update };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while updating your profile! - backend", 500);
        }
    }

    /**
     * 1. Validate the orderId first (throws a custom error if it goes wrong)
     * 2. Find and update the orderDetails using orderId, updates the default status with 'accepted'
     * 3. If the orderDetails is not found, throw a custom error
     * 4. Return the updated orderDetails
     */
    async adminAcceptOrder(orderId, admin) { // (test passed)
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id - backend", 400);
        if (!admin) throw new CustomError("Invalid admin! - backend", 400);
        try {

            // track the time of the order acception
            const timestamp = new Date().toLocaleString();

            // (test passed)
            const orderDetails = await OrderDetails.findById(orderId);
            const producDetails = await Products.findOne({ productName: orderDetails.orderProductName });
            if (producDetails) {
                producDetails.productQuantity -= orderDetails.orderQuantity;
                producDetails.save();
            }

            // It is more conveniet to use {new:true} instead of await order.save() when using .findbyIdAndUpdate
            const order = await OrderDetails.findByIdAndUpdate(orderId,
                {
                    acceptedByAdmin: 'accepted',
                    orderDispatchedTime: timestamp,
                    orderDispatchedBy: admin
                },
                { new: true } // Return the updated document
            );

            const mailInfo = {
                to: order.orderEmail,
                subject: 'Order Accepted',
                text: `Thanks, ${order.orderName} for choosing us and ordering ${order.orderQuantity} ${order.orderProductName}. Please order again. From Innocent Team.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.text);

            return order;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while accepting an order - backend", 500);
        }
    }

    /**
     * 1. Validates the orderId first (throws a custom error if it goes wrong)
     * 2. Find the orderDetails and delete it using orderId
     * 3. If the orderDetails is not found, throws a custom error
     * 4. Returns the deletion message if the orderDetails deletion is successfull
     */
    async adminRejectOrder(orderId, admin) {
        try {
            if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id", 400);
            if (!admin) throw new CustomError("Invlid admin name - backend", 400);

            const order = await OrderDetails.findByIdAndDelete(orderId); // Directly deletes the orderDetails from the database using orderId
            if (!order) throw new CustomError("Order not found!", 404);

            return { message: "Order rejected successfully." }; // Returns only the deletion message without the deleted orderDetails
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while rejecting an order! - backend", 500);
        }
    }

    async fetchOrderDetails(adminName) {
        if (!adminName || typeof adminName !== 'string') throw new CustomError("Invalid admin name (unauthorized) - backend", 400);
        try {
            const orders = await OrderDetails.find();
            if (!orders) throw new CustomError("Orders cannot be fetch! - backend", 500);
            return { message: `Order details fetched by admin- ${adminName} - backend`, orders };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while fetching order details! - backend", 500);
        }
    }
}
