import mongoose from "mongoose";
import products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";

export class CustomError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode
    }
}

class OrderService {
    /**
     * Inside OrderService
     *
     * // placeOrder (place order features for clients)
     *
     */
    async placeOrder(id, orderDetails) {
        try {
            if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid Id", 409);

            const product = await products.findById(id);
            if (!product) throw new CustomError("Product not found! - backend", 404);

            // Removing the product quantity from the product database according to the request orderProduct's quantity
            if (product.productQuantity >= orderDetails.orderQuantity) {
                product.productQuantity -= orderDetails.orderQuantity;
                await product.save();
            } else throw new CustomError(`Not enough ${product.productName}.`, 400)


            // when the order is place, automatically track the order time
            const timestamp = new Date().toLocaleString();

            // This response will be first appear to the client after he placed an order
            const orderResponse = await OrderDetails.create({
                ...orderDetails, orderProductName: product.productName, orderPrice: product.productPrice, orderTime: timestamp, status: 'pending' // set initial status to pending
            })

            return {
                message: "Order succesfully!",
                orderResponse
            }
        } catch (error) {
            throw error;
        }
    }

    // method to accept the placed order
    async acceptOrder(orderId) {
        try {
            const order = await OrderDetails.findByIdAndUpdate(
                orderId,
                { status: 'accepted' }, // Update the status
                { new: true } // Return the updated document
            );

            if (!order) throw new CustomError("Order not found!", 404);

            return order;
        } catch (error) {
            throw error;
        }

    }

    // method to reject order
    async rejectOrder(orderId) {
        try {
            const order = await OrderDetails.findByIdAndDelete(orderId);
            if (!order) throw new CustomError("Order not found!", 404);

            return { message: "Order rejected successfully." };
        } catch (error) {
            throw error;
        }

    }
}

export default OrderService;
