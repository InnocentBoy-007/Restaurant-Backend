import mongoose from 'mongoose';
import Product from '../model/productModel.js'

export const placeOrder = async (req, res) => {
    const { id } = req.params;
    const { orderPhoneNo, orderName, orderAddress, orderTime } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid) return res.status(400).json({
        error: "Invalid ID - backend"
    })

    try {
        // check if the product is available or not
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({
            message: "Product not available! - backend"
        })

        // control the productQuantity
        if (product.productQuantity > 0) {
            product.productQuantity -= 1;
            await product.save();
        } else {
            return res.status(400).json({
                message: `Sorry ${orderName}, ${product.productName} out of stock! - backend`
            })
        }


        res.status(200).json({
            message: "Order successfully! - backend",
            Order: {
                orderName: orderName,
                orderPhoneNo: orderPhoneNo,
                orderAddress: orderAddress,
                orderItem: product.productName,
                orderPrice: product.productPrice,
                orderTime: orderTime
            }
        })

    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || `Internal server error: ${error} - backend`
        })
    }
}
