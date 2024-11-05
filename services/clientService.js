import mongoose from "mongoose";
import products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";

export class OrderService {
    /**
     * Inside OrderService
     *
     * // placeOrder (place order features for clients)
     * // cancelOrder (cancel the placed order)
     *
     */
    async placeOrder(id, orderDetails) {
        try {
            if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid Id", 400);

            if (!orderDetails || typeof orderDetails !== 'object') {
                throw new CustomError("Please enter a valid information! - backend", 400);
            }

            const product = await products.findById(id);
            if (!product) throw new CustomError("Product not found! - backend", 404);

            // Removing the product quantity from the product database according to the request orderProduct's quantity
            if (product.productQuantity >= orderDetails.orderQuantity) {
                product.productQuantity -= orderDetails.orderQuantity;
                await product.save();
            } else throw new CustomError(`Not enough ${product.productName}.`, 400);


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

    async cancelOrder(id) {
        try {
            if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid Id - backend", 400);

            const order = await OrderDetails.findById(id);
            if (!order) throw new CustomError("Order not found! - backend", 404);

            if (order.status !== 'pending') throw new CustomError("Order cannot be canceled as it is already processed! - backend", 400);

            // Restoring the product quantity
            const product = await products.findById(order.productId);
            product.productQuantity += order.orderQuantity;
            await product.save();

            await OrderDetails.findByIdAndDelete(id);

            return { message: "Order canceled successfully! - backend", order };
        } catch (error) {
            throw error;
        }
    }

}
