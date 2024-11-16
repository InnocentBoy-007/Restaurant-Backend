import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import Products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";
import Otp from "../model/otp.js";
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

    // (test passed)
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
    async clientSignUpVerification(otp) {
        if (!otp || typeof otp !== 'string') throw new CustomError("Invalid otp! - backend", 400);

        try {
            if (otp !== this.otp) throw new CustomError("Wrong otp! - backend", 401); // check if the OTP is correct or not
            const hashPassword = await bcrypt.hash(this.clientDetails.password, 10);

            const signedUpAt = new Date().toLocaleString();

            const createClient = await Client.create({ ...this.clientDetails, password: hashPassword, signUpAt: signedUpAt });
            if (!createClient) throw new CustomError("Account cannot be created! - backend", 500);

            this.mailer.setUp();
            this.mailer.sentMail(this.clientDetails.email, "Signup successfully!", `Thanks for signing up, ${this.clientDetails.name}. From Innocent Restaurant`);

            const token = jwt.sign({ clientDetails: this.clientDetails }, process.env.JWT_SECRET, { expiresIn: '24h' }); // send the clientDetails as a token to be used for order placement in frontend

            return { message: "Account signup successfully! - backend", createClient, token };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing up! - backend", 500);
        }
    }

    async clientSignIn(clientDetails) {
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("All fields required!- backend");
        try {
            const checkClient = await Client.findOne({ email: clientDetails.email }).select("+password");
            if (!checkClient) throw new CustomError("Account not found! - backend", 404);

            const isCorrectPassword = await bcrypt.compare(clientDetails.password, checkClient.password);
            if (!isCorrectPassword) throw new CustomError("Wrong password - backend", 401);

            if (isCorrectPassword) {
                var newClientDetails = await Client.findOne({ name: checkClient.name }); // use this as a payload for jwt since it doesn't select password
            }

            this.clientDetails = newClientDetails; // udpate the clientDetails with the latest clientDetails

            const signedInAt = new Date().toLocaleString();

            // (need testing)
            const token = jwt.sign({ clientDetails: newClientDetails }, process.env.JWT_SECRET, { expiresIn: '24h' }); // send the newClientDetails(without password) as a token to be used for order placement in frontend (test pending)

            return { message: `Sign in successfully! signed in at ${signedInAt} - backend`, token };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in - backend", 500);
        }
    }

    // (test passed)
    async trackOrderDetails(clientEmail) {
        if (!clientEmail) throw new CustomError("Invalid user email address - backend", 400);
        try {
            const isValidClient = await OrderDetails.find({ orderEmail: clientEmail });
            if (!isValidClient) throw new CustomError("No orders found! - backend", 404);
            return { message: "Orders found! - backend", isValidClient };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to fetch orderDetails - backend", 500);
        }
    }

    //(test passed)
    // use jwt token for authorization (test pending)
    async addToCart(clientEmail, productId) {
        if (!clientEmail) throw new CustomError("Invalid client email - backend", 400);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id - backend", 400);
        try {
            //check if the product is already inside the cart or not
            const isDuplicateInsideCart = await Cart.findOne({ productId });
            if (isDuplicateInsideCart) throw new CustomError(`${isDuplicateInsideCart.productName} is already inside the cart! - backend`, 409);

            const checkProduct = await Products.findById(productId);
            if (!checkProduct) throw new CustomError("Product not found! - backend", 404);

            const addedTime = new Date().toLocaleString();

            const isAddedToCart = await Cart.create({
                productId: productId,
                productName: checkProduct.productName,
                productPrice: checkProduct.productPrice,
                addedTime: addedTime
            })

            return { message: `${isAddedToCart.productName} is added to cart successfully! - backend`, isAddedToCart };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to verify client email - backend", 500);
        }
    }

    // test passed in postman(partially tested - passed)
    async fetchProductsFromCart(clientEmail) { // use token for authorization
        if (!clientEmail) throw new CustomError("Invalid client email! - backend", 400);
        try {
            const checkProduct = await Cart.find();
            if (!checkProduct) throw new CustomError("Product not found! - backend", 404);
            return { message: "Product found inside the cart! - backend", checkProduct };
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to fetch products from cart! - backend", 500);
        }
    }

    // (test passed)
    async placeOrder(productId, clientDetails) { // send the request body along with the same phone number
        /**
         * Properties needed in clientDetails
         * 1. clientDetails.PhoneNo
         * 2. clientDetails.orderName
         * 3. clientDetails.orderQuantity
         * 4. clientDetails.orderAddress
         * 5. clientDetails.productId
         * 6. clientDetails.orderEmail
         */
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Please enter a valid productId! - backend", 400);
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("Please enter a valid information! - backend", 400);
        // Check for specific fields in clientDetails
        const requiredFields = [
            { key: 'orderName', message: 'Wrong name' },
            { key: 'orderPhoneNo', message: 'Wrong phoneNo' },
            { key: 'orderEmail', message: 'Wrong email' },
            { key: 'orderAddress', message: 'Wrong address' },
            { key: 'orderQuantity', message: 'Wrong quantity' }
        ];

        for (const field of requiredFields) {
            if (!clientDetails[field.key]) {
                throw new CustomError(field.message, 400);
            }
        }
        try {
            const product = await Products.findById(productId);
            if (!product) throw new CustomError("Cannot find the product! - backend", 404);
            this.product = product;

            if (clientDetails.orderQuantity > product.productQuantity) throw new CustomError(`Not enough ${product.productName}`, 409); // check the order quantity before the client verification (user experience)

            const mailInfo = {
                to: clientDetails.orderEmail,
                subject: "Order placed successfully! - backend",
                text: `Sir/Ma'am, your order of ${clientDetails.orderQuantity} ${clientDetails.orderProductName}(s) is on the process. Please wait a minute while the order is being dispatched! - Innocent Restaurant.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.text);

            const timestamp = new Date().toLocaleString();

            await OrderDetails.create({ ...clientDetails, orderTime: timestamp }) // save the order details inside the database

            return {
                message: `Order placed successfully!. Please wait a moment untill the placement process is completed and the order is being dispatched. Order placed at ${timestamp}`,
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
