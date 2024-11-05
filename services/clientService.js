import mongoose from "mongoose";
import products from '../model/productModel.js'
import OrderDetails from "../model/orderDetailsModel.js";
import { CustomError } from "../components/CustomError.js";

export class OrderService {
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

}
