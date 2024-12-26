import mongoose, { isValidObjectId } from "mongoose";
import Products from '../model/productModel.js'

import { CustomError } from "../components/CustomError.js";
import { SentMail } from "../components/middlewares/SentMail.js";
import CartModel from '../model/cartModel.js'

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
        const orderId = req.params;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ message: "Invalid order Id! - backend" });

        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid clientId - backend" });

        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(409).json({ message: "Invalid clientId! Unauthorized user - backend" });

            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) return res.status(404).json({ message: "Invalid order Id! Order not found! - backend" });

            const isValidProduct = await ProductModel.findById(isValidOrder.productId);
            if (!isValidProduct) return res.status(409).json({ message: "Invalid productId! - backend" });

            if (isValidOrder.status === 'pending') {
                isValidProduct += isValidOrder.productQuantity;
                await isValidOrder.deleteOne();
            } else {
                return res.status(409).json({ message: "Your order cannot be cancelled since it's already processed! - backend" });
            }

            return res.status(200).json({ message: "Order cancelled successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to cancel the order! - backend" });
        }
    }

    async orderReceivedConfirmation(req, res) {
        const orderId = req.params;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ message: "Invalid order Id - backend" });

        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid clientId! - backend" });

        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(409).json({ message: "Invalid clientId! Unauthorized user! - backend" });

            const isValidOrder = await OrderDetails.findById(orderId);
            if (!isValidOrder) return res.status(404).json({ message: "Invalid order Id! Order not found! - backend" });

            if (isValidOrder.status === 'accepted') {
                isValidOrder.receivedByClient = true;
                await isValidOrder.save();
            } else {
                return res.status(400).json({ message: "The admin needs to accept the order first! - backend" });
            }

            return res.status(200).json({ message: "Order received by client successfully! - backend" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to confirm an order received status! - backend" });
        }
    }

    async trackOrderDetails(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid clientId - backend" });

        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(404).json({ message: "Invalid clientId! Unauthorized user! - baceknd" });

            const orders = await OrderDetails.find({ clientId: isValidClient._id });
            if (!orders) return res.status(404).json({ message: "No orders found! - backend" });

            return res.status(200).json({ orders });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to track your order details! - backend" });
        }
    }

    async addProductsToCart(req, res) {
        const clientId = req.clientId;
        if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) return res.status(400).json({ message: "Invalid clientId - backend" });

        const { productId } = req.params;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid productId - backend" });

        try {
            const isValidClient = await ClientModel.findById(clientId);
            if (!isValidClient) return res.status(404).json({ message: "Invalid clientId! Unauthorized user! - backend" });

            const isValidProduct = await ProductModel.findById(productId);
            if (!isValidProduct) return res.status(404).json({ message: "Invalid productId! Product not found! - backend" });

            const addedProduct = await CartModel.create({
                clientId, productId, productName: isValidProduct.productName, productPrice: isValidProduct.productPrice, productQuantity: isValidProduct.productQuantity, addedTime: new Date().toLocaleString()
            })
            if (!addedProduct) return res.status(500).json({ message: `Failed to add ${isValidProduct.productName} in the cart! - backend` });

            return res.status(201).json({ message: `${addedProduct.productName} added to cart successfully! - backend`, addedProduct });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to add your product to the cart! - backend" });
        }
    }

    async fetchProductsFromCart(req, res) {

    }

    async removeProductsFromCart(req, res) {

    }
}

const clientServices = new ClientServices();
export default {
    placeOrder: clientServices.placeOrder, cancelOrder: clientServices.cancelOrder, orderReceivedConfirmation: clientServices.orderReceivedConfirmation, addProductsToCart: clientServices.addProductsToCart
}
