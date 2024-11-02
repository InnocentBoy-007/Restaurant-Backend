import mongoose from "mongoose";
import products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";

class OrderService {
    async placeOrder(id, orderDetails) {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error("Invalid ID");
            error.errorCode = 404;
            throw error;
        }

        const product = await products.findById(id);
        if (!product) {
            throw new Error("Product not found! - backend");
        }

        // Removing the product quantity from the product database according to the request orderProduct's quantity
        if (product.productQuantity >= orderDetails.orderQuantity) {
            product.productQuantity -= orderDetails.orderQuantity;
            await product.save();
        } else {
            const error = new Error(`Not enough ${product.productName}.`);
            error.errorCode = 400; // Bad request error code
            throw error;
        }

        // when the order is place, automatically track the order time
        const timestamp = new Date().toLocaleString();

        const orderResponse = await OrderDetails.create({
            orderName: orderDetails.orderName,
            orderProductName: product.productName,
            orderPrice: product.productPrice,
            orderQuantity: orderDetails.orderQuantity,
            orderAddress: orderDetails.orderAddress,
            orderPhoneNo: orderDetails.orderPhoneNo,
            orderTime: timestamp,
            status: 'pending' // set initial status to pending
        })

        return {
            message: "Order succesfully!",
            orderResponse
        }
    }

    // method to accept the placed order
    async acceptOrder(orderId) {
        // Update the order status directly in the database
        const order = await OrderDetails.findByIdAndUpdate(
            orderId,
            { status: 'accepted' }, // Update object
            { new: true } // Return the updated document
        );

        if (!order) {
            throw new Error("Order not found!");
        }

        return order;
    }

    async rejectOrder(orderId) {
        const order = await OrderDetails.findByIdAndDelete(orderId);
        if (!order) {
            throw new Error("Order not found!");
        }
        return { message: "Order rejected successfully." };
    }
}

export default OrderService;
