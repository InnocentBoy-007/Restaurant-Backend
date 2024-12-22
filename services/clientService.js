import mongoose from "mongoose";
import Products from '../model/productModel.js'

import { CustomError } from "../components/CustomError.js";
import { SentMail } from "../components/middlewares/SentMail.js";
import Cart from '../model/cardModel.js'
import Client from '../model/usermodel/clientModel.js'


import ClientModel from '../model/usermodel/clientModel.js'
import ProductModel from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";


export class OrderService {
    constructor() {
        this.mailer = new SentMail();
        this.clientDetails = null;
        this.product = null;
        this.otp = null;
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

class ClientServices {

    async placeOrder(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid clientId - backend" });
        const { orderDetails } = req.body;
        if (!orderDetails || typeof orderDetails !== 'object') return res.status(400).json({ message: "Order details is required! - backend" });
        if (!mongoose.Types.ObjectId.isValid(orderDetails.productId)) return res.status(409).json({ message: "The product Id is supposed to be a mongoose objectId" });

        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(404).json({ message: "Unauthorized user! - backend" });

            const isValidProduct = await ProductModel.findById(orderDetails.productId);
            if (!isValidProduct) return res.status(404).json({ message: "Product unavailable! - backend" });

            if (orderDetails.productQuantity > isValidProduct.productQuantity) {
                return res.status(409).json({ message: `Not enough ${isValidProduct.productName}! - backend` });
            } else {
                isValidProduct.productQuantity -= orderDetails.productQuantity;
                await isValidProduct.save();

                await OrderDetails.create({
                    // client details
                    clientId: isValidClient._id,
                    clientName: isValidClient.username,
                    email: isValidClient.email,
                    address: isValidClient.address,
                    phoneNo: isValidClient.phoneNo,

                    // order details
                    productId: isValidProduct._id,
                    productName: isValidProduct.productName,
                    productPrice: isValidProduct.productPrice,
                    totalPrice: (isValidProduct.productPrice * orderDetails.productQuantity),
                    productQuantity: orderDetails.productQuantity,
                    orderTime: new Date().toLocaleString()
                })

            }
            return res.status(200).json({ message: `${orderDetails.productQuantity} ${isValidProduct.productName} orderered succesfully!` })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to place an order! - baceknd" });
        }
    }

    async cancelOrder(req, res) {

    }

    async orderReceivedConfirmation(req, res) {

    }

    async trackOrderDetails(req, res) {

    }

    async addProductsToCart(req, res) {

    }

    async fetchProductsFromCart(req, res) {

    }

    async removeProductsFromCart(req, res) {

    }
}

const clientServices = new ClientServices();
export default {
    placeOrder: clientServices.placeOrder,
}
