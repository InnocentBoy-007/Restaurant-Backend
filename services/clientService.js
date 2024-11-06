import mongoose from "mongoose";
import Products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";
import Otp from "../model/otp.js";
import bcrypt from 'bcrypt'

export class OrderService {
    constructor() {
        /**
         * If you want to change the duration
         * e.g. ----> this.OTP_EXPIRATION_TIME = 2(first number) * 60 * 1000; // 2mins
         * Change the first number according to the min you desire
         */
        this.OTP_EXPIRATION_TIME = 60 * 1000; // 1min
    }

    async clientVerification(productId, phoneNo) {
        try {
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id", 400);

            if (!phoneNo || typeof phoneNo !== 'number') throw new CustomError("Please enter a valid phone number! - backend", 400);

            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate a random 6 digit number
            const hashOTP = await bcrypt.hash(generateOTP, 10); // hash the generated OTP for more security
            const expirationCountDown = new Date(Date.now() + this.OTP_EXPIRATION_TIME); // creating a countdown which starts from the OTP creation time untill 1 min.

            await Otp.create({
                OTP: hashOTP,
                phoneNo: phoneNo,
                productId: productId,
                expiresAt: expirationCountDown
            })
            console.log(`Your OTP: ${generateOTP}`); // the OPT should be 'generateOTP' since it hasn't been hashed yet

            return { message: "Your OTP expires in 60 seconds..."}; // it has to return the generateOTP since it hasn't been hashed yet

        } catch (error) {
            throw error;
        }
    }

    async placeOrder(otpCode, clientDetails) { // send the request body along with the same phone number
        /**
         * Properties needed in clientDetails
         * 1. clientDetails.orderPhoneNo
         * 2. clientDetails.orderName
         * 3. clientDetails.orderQuantity
         * 4. clientDetails.orderAddress
         * 5. clientDetails.productId
         */
        try {
            if (!otpCode || typeof otpCode !== 'string') throw new CustomError("Invalid OTP", 400);

            if (!clientDetails || typeof clientDetails !== 'object') {
                console.log(clientDetails);

                throw new CustomError("Please enter a valid information! - backend", 400);
            }

            const findClientDetails = await Otp.findOne({ phoneNo: clientDetails.orderPhoneNo }); // fetch the OTP details from the database first by comparing the phone numbers
            if (!findClientDetails) throw new CustomError("OTP not found! - backend", 404);

            const confirmOTP = await bcrypt.compare(otpCode, findClientDetails.OTP); // OTP code confirmation
            if (!confirmOTP) throw new CustomError("Wrong OTP", 401);

            // Check if the OTP has expired
            if (findClientDetails.expiresAt < Date.now()) {
                throw new CustomError("OTP has expired", 401);
            }

            const product = await Products.findById(clientDetails.productId); // fetch the product Id from req body
            if (!product) throw new CustomError("Product not found! - backend", 404);

            // Removing the product quantity from the product database according to the request orderProduct's quantity
            if (product.productQuantity >= clientDetails.orderQuantity) {
                product.productQuantity -= clientDetails.orderQuantity;
                await product.save();
            } else throw new CustomError(`Not enough ${product.productName}.`, 400);

            // when the order is placed, automatically track the order time
            const timestamp = new Date().toLocaleString();

            // This response will be first appear to the client after he placed an order
            const orderResponse = await OrderDetails.create({
                ...clientDetails, orderProductName: product.productName, orderPrice: product.productPrice, orderTime: timestamp, status: 'pending' // set initial status to pending
            })

            /**
            * Once everything is done or if the OTP is not provided within the specific time-limit, remove the OTP collection from the database to save enough space(optimization) or to prevent any unwanted errors or conflicts in the future
            * Reference from 'otp' collection
            */
            await Otp.deleteOne({ phoneNo: clientDetails.phoneNo });

            return {
                message: "Order placed succesfully!",
                orderResponse
            }
        } catch (error) {
            throw error;
        }
    }

    // needs code review ASAP
    async cancelOrder(orderId, orderProductDetails) {
        try {
            if (!id || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid Id - backend", 400);

            const order = await OrderDetails.findById(orderId);
            if (!order) throw new CustomError("Order not found! - backend", 404);

            if (order.status !== 'pending') throw new CustomError("Order cannot be canceled as it is already processed! - backend", 400);

            // Restoring the product quantity
            const product = await Products.findById(orderProductDetails.productId);
            product.productQuantity += orderProductDetails.orderQuantity;
            await product.save();

            await OrderDetails.findByIdAndDelete(orderId);

            return { message: "Order canceled successfully! - backend", order };
        } catch (error) {
            throw error;
        }
    }

}
