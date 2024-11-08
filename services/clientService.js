import mongoose from "mongoose";
import Products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";
import Otp from "../model/otp.js";
import bcrypt from 'bcrypt'
import { SentMail } from "../components/SentMail.js";

export class OrderService {
    constructor() {
        /**
         * If you want to change the duration
         * e.g. ----> this.OTP_EXPIRATION_TIME = 2(first number) * 60 * 1000; // 2mins
         * Change the first number according to the min you desire
         */
        this.OTP_EXPIRATION_TIME = 3 * 60 * 1000; // 3min
        this.mailer = new SentMail();
        this.orderEmail = null;
    }

    // (test passed)
    async clientVerification(productId, orderEmail) {
        this.orderEmail = orderEmail;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id", 400);
        if (!phoneNo || typeof phoneNo !== 'number') throw new CustomError("Please enter a valid phone number! - backend", 400);
        try {
            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate a random 6 digit number
            const hashOTP = await bcrypt.hash(generateOTP, 10); // hash the generated OTP for more security
            const expirationCountDown = new Date(Date.now() + this.OTP_EXPIRATION_TIME); // creating a countdown which starts from the OTP creation time untill 1 min.

            const mailInfo = {
                to: orderEmail,
                subject: "OTP for Order Verification",
                text: `Your OTP for order verification is ${hashOTP}. Please enter this OTP to complete the order process.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.body);

            await Otp.create({
                OTP: hashOTP,
                phoneNo: phoneNo,
                productId: productId,
                expiresAt: expirationCountDown
            })
            console.log(`Your OTP: ${generateOTP}`); // the OPT should be 'generateOTP' since it hasn't been hashed yet

            return { message: "Your OTP expires in 60 seconds..." }; // it has to return the generateOTP since it hasn't been hashed yet

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while verifying an OTP - backend", 500);
        }
    }

    // (test passed)
    async placeOrder(otpCode, clientDetails) { // send the request body along with the same phone number
        /**
         * Properties needed in clientDetails
         * 1. clientDetails.orderPhoneNo
         * 2. clientDetails.orderName
         * 3. clientDetails.orderQuantity
         * 4. clientDetails.orderAddress
         * 5. clientDetails.productId
         */
        if (!otpCode) throw new CustomError("Invalid OTP", 400); // the otp is in the form of string
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("Please enter a valid information! - backend", 400);
        try {
            const findClientDetails = await Otp.findOne({ orderEmail: this.orderEmail }); // fetch the OTP details from the database first by comparing the phone numbers
            if (!findClientDetails) throw new CustomError("OTP not found! - backend", 404);

            const confirmOTP = await bcrypt.compare(otpCode, findClientDetails.OTP); // OTP code confirmation (bug fixed)
            console.log("confirm OTP--->", confirmOTP); // testing (delete later)

            if (!confirmOTP) throw new CustomError("Wrong OTP", 401);

            // Check if the OTP has expired
            if (findClientDetails.expiresAt < Date.now()) {
                throw new CustomError("OTP has expired", 401);
            }

            await Otp.deleteOne({ orderEmail: this.orderEmail }); // delete the otp collection once the confirmation is done

            const product = await Products.findById(clientDetails.productId); // fetch the product Id from req body
            if (!product) throw new CustomError("Product not found! - backend", 404);

            // Removing the product quantity from the product database according to the request orderProduct's quantity
            if (product.productQuantity >= clientDetails.orderQuantity) {
                product.productQuantity -= clientDetails.orderQuantity;
                await product.save();
            } else throw new CustomError(`Not enough ${product.productName}.`, 400);

            // when the order is placed, automatically track the order time
            const timestamp = new Date().toLocaleString();

            const totalPrice = product.productPrice * clientDetails.orderQuantity;

            // This response will be first appear to the client after he placed an order
            const orderResponse = await OrderDetails.create({
                ...clientDetails, orderProductName: product.productName, productPrice: product.productPrice, totalPrice: totalPrice, orderTime: timestamp, status: 'pending', receivedByClient: false
            })

            return {
                message: "Order placed succesfully!",
                orderResponse
            }
        } catch (error) {
            console.log(error); // debugging
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while placing an order - backend", 500);
        }
    }

    // (test passed)
    async cancelOrder(orderId) { // send 'orderProductDetails' as req body
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id - backend", 400);
        try {
            const order = await OrderDetails.findById(orderId); // checks if the order is already accepted or not
            if (!order) throw new CustomError("Order not found! - backend", 404);

            if (order.acceptedByAdmin !== 'pending') throw new CustomError("Order cannot be canceled as it is already processed! - backend", 400);

            // Restoring the product quantity
            const product = await Products.findOne({ productName: order.orderProductName }); // fixed minor bug(changed findById to findOne)

            product.productQuantity += order.orderQuantity; // (bug fixed)
            await product.save();

            await OrderDetails.findByIdAndDelete(orderId);

            return { message: "Order canceled successfully! - backend" };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while canceling an order! - backend", 500);
        }
    }

    // method for client ordered product received confirmation (test passed)
    async orderConfirmation(orderId) { // clientConfirmation has to be either 'true' or 'false'
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid orderId - backend", 400);
        try {
            const confirmation = await OrderDetails.findByIdAndUpdate(orderId,
                { receivedByClient: true }, // boolean value
                { new: true }
            );
            if (!confirmation) throw new Error("Order not found! - backend", 404);

            return { message: "Product received by client! - backend" };

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while confirming an order - backend", 500);
        }
    }
}
