import mongoose from 'mongoose';
import AdminModel from '../model/usermodel/adminModel.js'
import OrderDetails from '../model/orderDetailsModel.js'
import bcrypt from 'bcrypt'
import { CustomError } from '../components/CustomError.js';
import { SentMail } from '../components/middlewares/SentMail.js';
import jwt from 'jsonwebtoken'
import Products from '../model/productModel.js'
import ClientModel from '../model/usermodel/clientModel.js';

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
        return jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '15s' });
    }

    async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.BACKUP_JWT_SECRET);
    }

    // (test passed)
    async adminSignUp(adminDetails) {
        if (!adminDetails || typeof adminDetails !== 'object') throw new CustomError("All fields required!(Bad Request) - backend", 400);
        try {
            const isAdminDuplicate = await AdminModel.findOne({ email: adminDetails.email, name: adminDetails.name }); // validation
            if (isAdminDuplicate) throw new CustomError("Account already exist! Please try other username - backend", 409);

            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate otp
            this.otp = generateOTP;

            const receiverInfo = { // (object)
                to: adminDetails.email,
                subject: "OTP confirmation",
                text: `${generateOTP} is your OTP to complete the signup process. Thanks from Coffee Team.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text); // otp will be sent to the registered email address
            this.adminDetails = adminDetails; // assigning all the req bodies to the instance variable

            return { message: `OTP is sent to your email "${this.adminDetails.email}"` }; // for testing
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in!", 500);
        }
    }

    // (test passed)
    async adminVerification(otp) {
        if (!otp || typeof otp !== 'string') throw new CustomError("OTP is not an string - backend", 400);
        try {
            if (otp !== this.otp) throw new CustomError("Wrong otp", 409);
            const hashPassword = await bcrypt.hash(this.adminDetails.password, 10); // encrypt the password using bcryt

            const account = await AdminModel.create({ ...this.adminDetails, password: hashPassword }) // create an admin account with adminDetails(using admin model)
            if (!account) throw new CustomError("Account cannot be created! - backend", 500); // if the account cannot be created, throw an error

            // Generate JWT after successful signup
            const token = await this.generateToken({ adminId: account._id });
            const refreshToken = await this.generateRefreshToken({ adminId: account._id });

            // updating the account with the refreshToken
            account.refreshToken = refreshToken;
            await account.save();

            const timestamp = new Date().toLocaleString(); // track the time of an account creation

            const receiverInfo = {
                to: account.email,
                subject: "Successfull sign up!",
                text: `Thanks ${account.name} for choosing Innocent Restaurant — From Innocent Team. Signed up on ${timestamp}.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text);

            let title = (account.gender === 'male') ? 'Mr' : 'Ms';

            return { message: `account sign up successfully! Welcome to Coffee, ${title}. ${account.name} - backend`, verification: `Verified on ${timestamp}`, token, refreshToken };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while verifying an OTP - backend", 500);
        }
    }

    // (test passed)
    async adminSignIn(adminDetails) { // email and password for signin
        if (!adminDetails || typeof adminDetails !== 'object') throw new CustomError("All fields required! - backend", 400);
        try {
            const account = await AdminModel.findOne({ adminEmail: adminDetails.adminEmail }).select("+password");
            if (!account) throw new CustomError("Account does not exist! - backend", 404);

            // compare passwords(enterPassword, storedPassword)
            const comparePassword = await bcrypt.compare(adminDetails.password, account.password);
            if (!comparePassword) throw new CustomError("IncorrectPassword! - backend", 409);

            const token = await this.generateToken({ adminId: account._id }); // using the adminName as the token for authorization
            const refreshToken = await this.generateRefreshToken({ adminId: account._id });

            let title = (account.gender = "Male") ? 'Mr' : 'Ms';

            return { message: `Signed in successfully! Welcome to Coffee, ${title}. ${account.name}`, token, refreshToken };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in - backend", 500);
        }
    }

    async adminLogOut(adminToken) { // add email and password validating codes
        if (!adminToken) throw new CustomError("Invalid token - backend", 400);
        try {
            return { message: "Logout successful! - backend" };
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

    async deleteAdmin(adminId, confirmPassword) {
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) throw new CustomError("Invalid id - backend", 400);
        if (!confirmPassword) throw new CustomError("Invalid password - backend", 400);
        try {
            const isValidAdmin = await AdminModel.findByIdAndDelete(adminId).select("+password");
            if (!isValidAdmin) throw new CustomError("Admin not found! - backend", 404);

            const isValidPassword = await bcrypt.compare(confirmPassword, isValidAdmin.password);
            if (!isValidPassword) throw new CustomError("Incorrect password! - backend", 403);
            await isValidAdmin.deleteOne();

            return { message: "Account deleted successfully! - backend" };
        } catch (error) {
            console.log(error);

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


    // (test passed)
    async adminAcceptOrder(orderId, adminId) {
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid order Id - backend", 400);
        if (!adminId) throw new CustomError("Invalid admin Id! - backend", 400);
        try {
            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) throw new CustomError("Order not found! - backend", 404);

            const isAdminDuplicate = await AdminModel.findById(adminId);
            if (!isAdminDuplicate) throw new CustomError("Unauthorized admin! - backend", 409);

            const isValidProduct = await Products.findById(isValidOrder.productId);

            const alterProductQuantity = isValidProduct.productQuantity -= isValidOrder.productQuantity;
            if (!alterProductQuantity) throw new CustomError("An error occured while trying to alter product Quantity - backend", 500);
            await isValidProduct.save();

            if (isValidOrder) {
                isValidOrder.orderDispatchedTime = new Date().toLocaleString();
                isValidOrder.acceptedByAdmin = 'accepted';
                isValidOrder.orderDispatchedBy = isAdminDuplicate.name;
                await isValidOrder.save();
            }

            const mailInfo = {
                to: isValidOrder.email,
                subject: 'Order Accepted!',
                text: `Thanks, ${isValidOrder.clientName} for choosing us and ordering ${isValidOrder.productQuantity} ${isValidOrder.productName}. Please order again. From Innocent Team. Order dispatched at ${isValidOrder.orderDispatchedTime}.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.text);

            return { message: "Order accepted succesfully! - backend" };
        } catch (error) {
            console.log(error);

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
    // (test passed)
    async adminRejectOrder(orderId, adminId) {
        try {
            if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid order Id", 401);
            if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) throw new CustomError("Unauthorized admin - backend", 401);

            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) throw new CustomError("Order not found!", 404);

            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) throw new CustomError("Unauthorized admin! - backend", 409);

            const isValidClient = await ClientModel.findById(isValidOrder.clientId);
            if (!isValidClient) throw new CustomError("Client not found! - backend", 404);
            const title = (isValidClient.gender == 'male') ? 'Mr' : 'Ms';

            await isValidOrder.deleteOne();

            const receiverInfo = {
                to: isValidClient.email,
                subject: 'Order rejected!',
                text: `Sorry ${title}. ${isValidClient.name}, your order has been rejected!`
            }

            this.mailer.setUp();
            this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text);

            return { message: `Order rejected successfully! Order rejected by ${isValidAdmin.name} - backend` }; // Returns only the deletion message without the deleted orderDetails
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while rejecting an order! - backend", 500);
        }
    }

    async fetchOrderDetails(adminId) {
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) throw new CustomError("Invalid admin (unauthorized) - backend", 400);
        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) throw new CustomError("Unauthorized admin - backend", 409);

            const orders = await OrderDetails.find();
            if (!orders) throw new CustomError("Orders cannot be fetch! - backend", 500);

            return { orders };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while fetching order details! - backend", 500);
        }
    }
}
