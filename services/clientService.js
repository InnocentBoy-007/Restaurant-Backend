import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import Products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";
import { SentMail } from "../components/middlewares/SentMail.js";
import Cart from '../model/cardModel.js'
import Client from '../model/usermodel/clientModel.js'
import clientModel from "../model/usermodel/clientModel.js";

export class OrderService {
    constructor() {
        this.mailer = new SentMail();
        this.clientDetails = null;
        this.product = null;
        this.otp = null;
    }

    async deleteClient(clientId, confirmPassword) {
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) throw new CustomError("Invalid clientId! - backend", 400);
        if (!confirmPassword) throw new CustomError("Invalid confirmation password - backend", 400);
        try {
            const isValidClient = await clientModel.findById(clientId).select("+password");
            if (!isValidClient) throw new CustomError("Account not found! - backend", 404);

            const isValidPassword = await bcrypt.compare(confirmPassword, isValidClient.password);
            if (!isValidPassword) throw new CustomError("Incorrect password! - backend", 403);
            await isValidClient.deleteOne();

            return { message: "Account deleted successfully! - backend" };
        } catch (error) {
            console.log(error);

            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to delete your account! - backend", 500);
        }
    }

    async updateClient(clientId, clientDetails) {
        if (!clientId) throw new CustomError("Invalid client Id! - backend", 400);
        if (!clientDetails || typeof clientDetails !== 'object') throw new CustomError("Invalid client details! - backend", 400);
        try {
            const isValidClient = await clientModel.findByIdAndUpdate(clientId, clientDetails, { new: true });
            if (!isValidClient) throw new CustomError("Client not found! - backend", 404);

            return { message: "Account updated successfully! - backend" };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while trying to update your account! - backend", 500);
        }
    }

    // (test passed)
    async trackOrderDetails(email) {
        if (!email) throw new CustomError("Invalid email! - backend", 409);
        try {
            const orderDetails = await OrderDetails.find({ email });
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
                productQuantity: product.productQuantity,
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
    async orderConfirmation(orderId, email) { // clientConfirmation has to be either 'true' or 'false'
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) throw new CustomError("Invalid orderId - backend", 401);

        if (!email) throw new CustomError("Invalid email! Authorization revoked! - backend", 401);
        try {
            const isValidOrderId = await OrderDetails.findById(orderId);
            if (!isValidOrderId) throw new Error("Order not found! - backend", 404);

            if (email !== isValidOrderId.email) throw new CustomError("Incorrect email! Authorization denied! - backend", 409);

            const update = isValidOrderId.receivedByClient = true;
            if (!update) throw new CustomError("Update failed! - backend", 500);

            await isValidOrderId.save();

            return { message: "Product received by client! - backend" };

        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while confirming an order - backend", 500);
        }
    }
}
