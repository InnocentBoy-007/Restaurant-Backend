import mongoose from "mongoose";
import products from '../model/productModel.js'
import axios from "axios";
import dotenv from 'dotenv'

dotenv.config();

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

        const orderResponse = {
            message: "Order successfully!",
            Order: {
                orderName: orderDetails.orderName,
                orderProductName: product.productName,
                orderPrice: product.productPrice,
                orderQuantity: orderDetails.orderQuantity,
                orderAddress: orderDetails.orderAddress,
                orderPhoneNo: orderDetails.orderPhoneNo,
                orderTime: orderDetails.orderTime
            }
        }
        // Call postOrderResponseToAdmin to send the order to the admin panel
        // Creating an instance method
        /**
         * Send order response to admin panel awaiting the result
         */
        await this.postOrderResponseToAdmin(orderResponse)

        return orderResponse;
    }

    // posting the orderRespond to the admin Panel (use another server)
    async postOrderResponseToAdmin(orderResponse) {
        try {
            const adminEndpoint = process.env.ADMIN_ENDPOINT;
            const response = await axios.post(adminEndpoint, orderResponse);
            console.log('Admin notified successfully:', response.data);
        } catch (error) {
            console.log(`Failed to notify the admin panel: ${error.message}`);
        }
    }
}

export const placeOrder = async (req, res) => {
    const { id } = req.params;
    const { orderDetails } = req.body;
    const orderService = new OrderService();

    try {
        const response = await orderService.placeOrder(id, orderDetails);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.errorCode || 500).json({
            error: error.message || "Internal server error! - backend"
        })
    }
}
