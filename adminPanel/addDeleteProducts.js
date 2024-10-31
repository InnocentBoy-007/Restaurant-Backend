import mongoose from 'mongoose';
import Product from '../model/productModel.js'

export const addProduct = async (req, res) => {
    const { productName, productPrice } = req.body;
    try {
        const add = await Product.create({
            productName: productName,
            productPrice: productPrice
        })
        if (!add) return res.status(400).json({
            error: "Product add failed! - backend"
        })

        res.status(201).json({
            message: "Product added successfully! - backend",
            add
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || `Internal server error: ${error} - backend`
        })
    }
}

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const {productName, productPrice, productQuantity} = req.body;
    /**
     // use this if the frontend req.body and the database schema properties is same
     * const { updates } = req.body;
     */


    if (!id || !mongoose.Types.ObjectId.isValid) {
        return res.status(400).json({
            message: "Invalid Id - backend"
        })
    }
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({
            message: "Product not found! - backend"
        })

        /**
         //use this if the req.body from the frontend is same as the schema properties
         * Object.keys(updates).forEach((key) => {
            if (product[key] !== undefined) {
                product[key] = updates[key]; // Update the field only if it exists
            }
        });
         */
        if(productName) {
            product.productName = productName
        }
        if(productPrice) {
            product.productPrice = productPrice
        }
        if(productQuantity) {
            product.productQuantity = productQuantity
        }

        await product.save();

        res.status(200).json({
            message: "Product updated successfully! - backend",
            product
        })

    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message || `Internal server error - backend`
        })
    }
}
