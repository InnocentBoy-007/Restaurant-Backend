import mongoose from 'mongoose';
import AdminModel from '../model/usermodel/adminModel.js'
import OrderDetails from '../model/orderDetailsModel.js'
import bcrypt from 'bcrypt'
import { CustomError } from '../components/CustomError.js';
import { SentMail } from '../components/middlewares/SentMail.js';
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
        this.mailer = new SentMail();
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
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while fetching order details! - backend", 500);
        }
    }
}
