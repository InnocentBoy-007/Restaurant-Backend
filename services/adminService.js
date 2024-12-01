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

    async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.BACKUP_JWT_SECRET);
    }

    // (test passed)
    async adminSignUp(adminDetails) {
        if (!adminDetails || typeof adminDetails !== 'object') throw new CustomError("All fields required!(Bad Request) - backend", 400);

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
            const isAdminNameDuplicate = await AdminModel.findOne({ name: adminDetails.name }); // checking for account duplicacy using 'adminName'
            if (isAdminNameDuplicate) throw new CustomError("Username already exist! Please try other username - backend", 409);

            const isAdminEmailDuplicate = await AdminModel.findOne({ email: adminDetails.email });
            if (isAdminEmailDuplicate) throw new CustomError("User email already exist! Please try other email - backend", 409);

            this.adminDetails = adminDetails; // assigning all the req bodies to the instance variable

            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate otp
            this.otp = generateOTP;

            const receiverInfo = { // (object)
                to: adminDetails.email,
                subject: "OTP confirmation",
                text: `Use this OTP for the signup process ${generateOTP}. Thanks from Innocent Team.`
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
        if (!otp || typeof otp !== 'string') throw new CustomError("Invalid otp - backend", 400);
        try {
            if (otp !== this.otp) throw new CustomError("Wrong otp", 409);
            const hashPassword = await bcrypt.hash(this.adminDetails.password, 10); // encrypt the password using bcryt

            const account = await AdminModel.create({ ...this.adminDetails, password: hashPassword }) // create an admin account with adminDetails(using admin model)
            if (!account) throw new CustomError("Account cannot be created! - backend", 500); // if the account cannot be created, throw an error

            // Generate JWT after successful signup
            const token = await this.generateToken({ adminId: account._id }); //(primary token)  // using the admin_id as the token for authorization
            const refreshToken = await this.generateRefreshToken({ adminId: account._id });
            console.log("Primary token backend--->", token);
            console.log("Refresh token backend--->", refreshToken);

            // updating the account with the refreshToken
            account.refreshToken = refreshToken;
            await account.save();

            const timestamp = new Date().toLocaleString(); // track the time of an account creation

            const receiverInfo = {
                to: this.adminDetails.email,
                subject: "Successfull sign up!",
                text: `Thanks ${this.adminDetails.name} for choosing Innocent Restaurant — From Innocent Team. Signed up on ${timestamp}.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(receiverInfo.to, receiverInfo.subject, receiverInfo.text);

            return { message: "Account sign up successfull! - backend", adminDetails: account, verification: `Verified on ${timestamp}`, token, refreshToken };
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
    async adminSignIn(adminDetails) {
        if (!adminDetails || typeof adminDetails !== 'object') throw new CustomError("All fields required! - backend", 400);

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

            const token = await this.generateToken({ adminId: account._id }); // using the adminName as the token for authorization
            const refreshToken = await this.generateRefreshToken({ adminId: account._id });

            return { message, signInAt: timestamp, token, refreshToken };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in - backend", 500);
        }
    }

    async adminLogOut(adminToken) { // add email and password validating codes
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


    async adminAcceptOrder(orderId, productId, adminId) { // (test passed)
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid order Id - backend", 400);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id - backend", 400);
        if (!adminId) throw new CustomError("Invalid admin Id! - backend", 400);
        try {
            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) throw new CustomError("Order not found! - backend", 404);

            const isValidProduct = await Products.findById(productId);
            if (!isValidProduct) throw new CustomError("Product not found! - backend", 404);

            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) throw new CustomError("Unauthorized admin! - backend", 409);

            const alterProductQuantity = isValidProduct.productQuantity -= isValidOrder.productQuantity;
            if (!alterProductQuantity) throw new CustomError("An error occured while trying to alter product Quantity - backend", 500);
            await isValidProduct.save();

            isValidOrder.orderDispatchedTime = new Date().toLocaleString();
            isValidOrder.acceptedByAdmin = 'accepted';
            isValidOrder.orderDispatchedBy = isValidAdmin.name;
            await isValidOrder.save();

            const mailInfo = {
                to: isValidOrder.email,
                subject: 'Order Accepted',
                text: `Thanks, ${isValidOrder.clientName} for choosing us and ordering ${isValidOrder.productQuantity} ${isValidOrder.productName}. Please order again. From Innocent Team.`
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

    async fetchOrderDetails(adminId) {
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) throw new CustomError("Invalid admin (unauthorized) - backend", 400);
        try {
            const adminName = await AdminModel.findById(adminId).select("name");
            const orders = await OrderDetails.find();
            if (!orders) throw new CustomError("Orders cannot be fetch! - backend", 500);
            return { message: `Order details fetched by admin- ${adminName} - backend`, orders };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while fetching order details! - backend", 500);
        }
    }
}
