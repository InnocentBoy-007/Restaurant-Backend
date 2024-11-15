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
        /**
         * If you want to change the duration
         * e.g. ----> this.OTP_EXPIRATION_TIME = 2(first number) * 60 * 1000; // 2mins
         * Change the first number according to the min you desire
         */
        this.OTP_EXPIRATION_TIME = 3 * 60 * 1000; // 3mins
        this.mailer = new SentMail();
        this.clientDetails = null;
        this.product = null;
        this.addToCartOTP = null;
        this.clientEmail = null;
        this.otp = null;
    }

    // (test passed)
    async clientSignUp(clientDetails) {
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("All fields required! - backend", 400);
        try {
            const isAccountDuplicate = await Client.findOne({ email: clientDetails.email });
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

            return { message: `Email verification OTP is send to ${clientDetails.email}. Please verify your OTP to complete the signup process! - backend` }
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to signup! - backend", 500);
        }
    }

    // (test passed)
    async clientSignUpVerification(otp) {
        if (!otp || typeof otp !== 'string') throw new CustomError("Invalid otp! - backend", 400);
        if (otp !== this.otp) throw new CustomError("Wrong otp! - backend", 401);

        try {
            const hashPassword = await bcrypt.hash(this.clientDetails.password, 10);
            const createClient = await Client.create({ ...this.clientDetails, password: hashPassword });
            if (!createClient) throw new CustomError("Account cannot be created! - backend", 500);

            this.mailer.setUp();
            this.mailer.sentMail(this.clientDetails.email, "Signup successfully!", `Thanks for signing up, ${this.clientDetails.name}. From Innocent Restaurant`);

            const token = jwt.sign({ clientName: this.clientDetails.name, clientEmail: this.clientDetails.email, clientId: this.clientDetails._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

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
            const checkClient = await Client.findOne({ name: clientDetails.name }).select("+password");
            if (!checkClient) throw new CustomError("Account not found! - backend", 404);

            const isCorrectPassword = await bcrypt.compare(clientDetails.password, checkClient.password);
            if (!isCorrectPassword) throw new CustomError("Wrong password - backend", 401);

            const token = jwt.sign({ name: checkClient.name }, process.env.JWT_SECRET, { expiresIn: '24h' });

            return { message: "Sign in successfully! - backend", checkClient, token };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while signing in - backend", 500);
        }
    }

    // (test passed)
    async trackOrderDetails(phoneNo) {
        if (!phoneNo || typeof phoneNo !== 'string') throw new CustomError("Invalid phone number - backend", 400);
        try {
            const confirmPhoneNo = await OrderDetails.find({ orderPhoneNo: phoneNo });
            if (!confirmPhoneNo) throw new CustomError("Orders not found! - backend", 404);
            return { message: "Orders found! - backend", confirmPhoneNo };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to fetch orderDetails - backend", 500);
        }
    }

    //(test passed)
    async addToCartVerification(clientEmail, productId) {
        if (!clientEmail) throw new CustomError("Invalid client email - backend", 400);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid product Id - backend", 400);
        try {
            //check if the product is already inside the cart or not
            const isDuplicateInsideCart = await Cart.findOne({ productId });
            if (isDuplicateInsideCart) throw new CustomError(`${isDuplicateInsideCart.productName} is already inside the cart! - backend`, 409);

            this.clientEmail = clientEmail;
            const checkProduct = await Products.findById(productId);
            if (!checkProduct) throw new CustomError("Product not found! - backend", 404);
            this.product = checkProduct;
            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString();
            this.addToCartOTP = generateOTP;
            const client = {
                to: clientEmail,
                subject: "Email verification",
                text: `Your OTP for order verification is ${generateOTP}. Please enter this OTP to complete the add-to-cart process.`
            }
            await this.mailer.setUp();
            await this.mailer.sentMail(client.to, client.subject, client.text);
            return { message: `Please verify the email sent to ${clientEmail}` }
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to verify client email - backend", 500);
        }
    }

    // (test passed)
    async addToCart(otp) {
        if (!otp || typeof otp !== 'string') throw new CustomError("Invalid otp - backend", 400);
        try {
            if (otp !== this.addToCartOTP) throw new CustomError("Wrong OTP - backend", 401);
            const timestamp = new Date().toLocaleString();

            const cart = await Cart.create({
                productId: this.product._id,
                productName: this.product.productName,
                productPrice: this.product.productPrice,
                addedTime: timestamp
            });
            if (!cart) throw new CustomError("CartDB cannot be created! - backend", 500);

            // add jwt later for client side authorization
            const token = jwt.sign({ clientEmail: this.clientEmail }, process.env.JWT_SECRET, { expiresIn: '24h' });

            return { message: 'Product added to cart successfully! - backend', cart, token };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to add product in the cart! - backend", 500);
        }
    }

    // test passed in postman(partially tested - passed)
    async fetchProductsFromCart(clientEmail) {
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

            this.clientDetails = clientDetails;

            const generateOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generate a random 6 digit number
            // const hashOTP = await bcrypt.hash(generateOTP, 10); (can hash otp for more security)
            const expirationCountDown = new Date(Date.now() + this.OTP_EXPIRATION_TIME); // creating a countdown which starts from the OTP creation time untill 1 min.

            const mailInfo = {
                to: clientDetails.orderEmail,
                subject: "OTP for Order Verification",
                text: `Your OTP for order verification is ${generateOTP}. Please enter this OTP to complete the order process.`
            }

            await this.mailer.setUp();
            await this.mailer.sentMail(mailInfo.to, mailInfo.subject, mailInfo.text);

            const timestamp = new Date().toLocaleString();

            await Otp.create({
                OTP: generateOTP,
                expiresAt: expirationCountDown
            })

            return {
                message: `Please verify your phone number first before placing the order. Please verify your OTP sent to '${clientDetails.orderEmail}'. Order placed at ${timestamp}`,
            }
        } catch (error) {
            console.log(error); // debugging
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while placing an order - backend", 500);
        }
    }

    // (test passed)
    async clientVerification(otp) {
        if (!otp) throw new CustomError("OTP is required!", 400);

        try {
            const findOTP = await Otp.findOne({ OTP: otp.OTP });
            if (!findOTP) throw new CustomError("OTP not found! - backend", 404);

            if (findOTP.expiresAt < Date.now()) throw new CustomError("OTP has expired", 401); // Check if the OTP has expired

            /**
             * THIS IS TO BE DONE AT ADMIN SERVICE AFTER THE ORDER IS CONFIRMED BY THE ADMIN (test passed)
             * Removing the product quantity from the product database according to the request orderProduct's quantity
             * Doesn't need to check the order quantity again, since it has already been checked
             */
            await Otp.deleteOne({ OTP: otp.OTP }); // delete the otp collection once the confirmation is done

            // do the product quantity decremention in admin service (test passed)
            // this.product.productQuantity -= this.clientDetails.orderQuantity;
            // await this.product.save();

            // when the order is placed, automatically track the order time
            const timestamp = new Date().toLocaleString();

            const totalPrice = this.product.productPrice * this.clientDetails.orderQuantity;

            const orderDetails = await OrderDetails.create({
                ...this.clientDetails, orderProductName: this.product.productName, productPrice: this.product.productPrice, totalPrice: totalPrice, orderTime: timestamp, status: 'pending', receivedByClient: false
            })

            // const remove_productsFromCart = await Cart.findByIdAndDelete(this.product._id); // testing
            // if (remove_productsFromCart) {
            //     var removedMessage = `${this.product.productName} removed from cart! - backend`;
            // }

            return { message: `${this.clientDetails.orderName}, your order is placed succsesfully! Please wait for the order to be dispatched! And please don't forget to send the order reception verification - backend`, orderDetails };

        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while verifying an OTP - backend", 500);
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
