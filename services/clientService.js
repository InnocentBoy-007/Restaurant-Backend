import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import Products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";
import Otp from "../model/otp.js"; // for future use
import { SentMail } from "../components/SentMail.js";
import Cart from '../model/cardModel.js'
import jwt from 'jsonwebtoken'
import Client from '../model/clientModel.js'

export class OrderService {
    constructor() {
        this.mailer = new SentMail();
        this.clientDetails = null;
        this.product = null;
        this.otp = null;
    }

    async generateToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, { 'expiresIn': '15m' }); // it's working
    }

    async generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.BACKUP_JWT_SECRET);
    }

    // (test passed)
    // endpoint ---> 'user/singup'
    async clientSignUp(clientDetails) {
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("All fields required! - backend", 400);
        try {
            const isAccountDuplicate = await Client.findOne({ email: clientDetails.email }); // using 'email' as the primary key
            if (isAccountDuplicate) throw new CustomError(`${isAccountDuplicate.email} is already in used! Please try other email - backend`, 401)
            this.clientDetails = clientDetails;

            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString();
            this.otp = generateOTP;

            const mailInfo = {
                to: clientDetails.email,
                subject: 'Email verification',
                text: `Please verify your email by using the ${generateOTP} as the OTP`
            }
            this.mailer.setUp();
            this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.text);

            return { message: `Email verification OTP is sent to ${clientDetails.email}. Please verify your OTP to complete the signup process! - backend` }
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to signup! - backend", 500);
        }
    }

    // (test passed)
    // endpoint ---> 'user/singup/verify'
    async clientSignUpVerification(otp) {
        if (!otp || typeof otp !== 'string') throw new CustomError("Invalid otp! - backend", 400);

        try {
            if (otp !== this.otp) throw new CustomError("Wrong otp! - backend", 401); // check if the OTP is correct or not
            const hashPassword = await bcrypt.hash(this.clientDetails.password, 10);

            const createClient = await Client.create({ ...this.clientDetails, password: hashPassword, signUpAt: new Date().toLocaleString() }); // adding the refresh token as well for future use
            if (!createClient) throw new CustomError("Account cannot be created! - backend", 500);

            const token = await this.generateToken({ clientId: createClient._id, name: createClient.name }); // send the clientDetails as a token to be used for order placement in frontend
            const refreshToken = await this.generateRefreshToken({ clientId: createClient._id }); // refresh token

            createClient.refreshToken = refreshToken; // update the refresh token
            await createClient.save();

            this.mailer.setUp();
            this.mailer.sentMail(this.clientDetails.email, "Signup successfully!", `Thanks for signing up, ${this.clientDetails.name}. From Innocent Restaurant`);

            return { message: "Account signup successfully! - backend", createClient, token, refreshToken };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing up! - backend", 500);
        }
    }

    //endpoint ---> 'user/signin'
    async clientSignIn(clientDetails) {
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("All fields required!- backend");
        try {
            const isValidClient = await Client.findOne({ email: clientDetails.email }).select("+password"); // using 'email' as a primary key
            if (!isValidClient) throw new CustomError("Account not found! - backend", 404);

            const isCorrectPassword = await bcrypt.compare(clientDetails.password, isValidClient.password);
            if (!isCorrectPassword) throw new CustomError("Wrong password - backend", 401);

            const newClientDetails = await Client.findOne({ name: isValidClient.name }); // use this as a payload for jwt since it doesn't select password

            // adding the refresh token inside the clientDetails
            const token = await this.generateToken({ clientId: isValidClient._id, name: isValidClient.name }); // send the newClientDetails(only client name) as a token to be used for order placement in frontend (test pending)
            const refreshToken = await this.generateRefreshToken({ clientId: isValidClient._id }); // refresh token

            this.clientDetails = newClientDetails; // udpate the clientDetails with the latest clientDetails (password not included)

            const signedInAt = new Date().toLocaleString();

            return { message: `Sign in successfully! signed in at ${signedInAt} - backend`, newClientDetails, token, refreshToken }; // needs testing
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in - backend", 500);
        }
    }

    // needs to review(bug)
    async clientLogout(clientToken) {
        if (!clientToken) throw new CustomError("Invalid token! - backend", 400);

        try {
            return { message: "Logout successful! - backend" };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to logout! - backend", 500);
        }
    }

    // (test passed)
    async trackOrderDetails(clientId) {
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) throw new CustomError("Invalid user email address - backend", 400);
        try {
            const orderDetails = await OrderDetails.find({ clientId });
            if (!orderDetails) throw new CustomError("No orders found! - backend", 404);
            return { message: "Orders found! - backend", orderDetails };
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to fetch orderDetails - backend", 500);
        }
    }

    //(test passed)
    // use jwt token for authorization (test pending)
    async addToCart(clientId, productId) { // using client Email as a primary key
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) throw new CustomError("Invalid clientId - backend", 400);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id - backend", 400);
        try {
            //check if the product is already inside the cart or not
            const isDuplicateInsideCart = await Cart.findOne({ productId });
            if (isDuplicateInsideCart) throw new CustomError(`${isDuplicateInsideCart.productName} is already inside the cart! - backend`, 409);

            const product = await Products.findById(productId);
            if (!product) throw new CustomError("There's a problem while adding checking the product in the product database - backend", 500);

            const isAddedToCart = await Cart.create({
                clientId,
                productId,
                productName: product.productName,
                productPrice: product.productPrice,
                addedTime: new Date().toLocaleString()
            })

            return { message: `${isAddedToCart.productName} is added to cart successfully on ${isAddedToCart.addedTime} - backend`, isAddedToCart };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to add the product to cart - backend", 500);
        }
    }

    // test passed
    async removeProductFromCart(productId, clientId) {
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id - backend", 400);
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) throw new CustomError("Invalid clientId - backend", 400);

        try {
            const product = await Cart.findOne({ productId, clientId }); // using productId and clientId for validating
            if (!product) throw new CustomError("Product not found! - backend", 404);

            await product.deleteOne();

            return { message: `${product.productName} deleted from cart successfully! - backend` }
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to delete products from cart! - backend", 500);
        }
    }

    // test passed in postman(partially tested - passed)
    async fetchProductsFromCart(clientId) { // use token for authorization
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) throw new CustomError("Invalid clientID - backend", 401);
        try {
            const cartDetails = await Cart.find({ clientId });

            if (!cartDetails) throw new CustomError("An unexpected error occured while fetching order details! - backend", 401);

            if (cartDetails.length === 0) {
                return { message: "No items inside the cart! - backend", cartDetails };
            }

            return { message: "Product found inside the cart! - backend", cartDetails };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to fetch products from cart! - backend", 500);
        }
    }

    // (test passed)
    async placeOrder(clientId, orderDetails) {
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) throw new CustomError("Invalid clientId - backend", 401);
        if (!orderDetails || typeof orderDetails !== 'object') throw new CustomError("Please enter a valid information! - backend", 400);
        const productId = orderDetails.productId;
        const productQuantity = orderDetails.productQuantity
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Please enter a valid productId! - backend", 400);
        try {
            const isValidProduct = await Products.findById(productId);
            if (!isValidProduct) throw new CustomError("Cannot find the product! - backend", 404);
            this.product = isValidProduct;

            const isValidClient = await Client.findById(clientId);
            if (!isValidClient) throw new CustomError("Unauthorized user! - backend", 409);

            // compare the order product quantity and the existing product quantity. If the order product quantity is more than the existing product quantity, throw an error
            if (orderDetails.productQuantity > isValidProduct.productQuantity) throw new CustomError(`Not enough ${isValidProduct.productName}`, 409);

            const totalPrice = isValidProduct.productPrice * orderDetails.productQuantity;

            await OrderDetails.create({
                clientId: isValidClient._id,
                clientName: isValidClient.name,
                email: isValidClient.email,
                address: isValidClient.address,
                phoneNo: isValidClient.phoneNo,

                productId: isValidProduct._id,
                productName: isValidProduct.productName,
                productPrice: isValidProduct.productPrice,
                totalPrice,
                productQuantity,

                orderTime: new Date().toLocaleString()
            });

            return {
                message: `Order placed successfully! Please wait a moment untill the placement process is completed and the order is being dispatched.`,
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

    // method for client ordered product received confirmation (test pending)
    async orderConfirmation(orderId) { // clientConfirmation has to be either 'true' or 'false'
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid orderId - backend", 400);
        try {
            const isValidOrderId = await OrderDetails.findById(orderId);
            if (!isValidOrderId) throw new Error("Order not found! - backend", 404);

            const update = isValidOrderId.receivedByClient = true;
            if (!update) throw new CustomError("Update failed! - backend", 500);

            await isValidOrderId.save();

            return { message: "Product received by client! - backend" };

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while confirming an order - backend", 500);
        }
    }
}
