import mongoose from 'mongoose';
import Product from '../model/productModel.js'

class AdminControl {
    async addProduct(productDetails) {
        if (!productDetails || typeof productDetails !== 'object') {
            throw new Error("Product details are necessary!");
        }

        const productAddedOn = new Date().toLocaleString();

        const addProductResponse = await Product.create({
            productName: productDetails.productName,
            productPrice: productDetails.productPrice,
            productQuantity: productDetails.productQuantity,
            productAddedOn: productAddedOn
        })

        return {
            message: "Product added successfully! - backend",
            addProductResponse
        }
    }

    async updateProduct(id, productDetails) {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid ID - backend")
        }
        if (!productDetails || typeof productDetails !== 'object') {
            throw new Error("Product details are necessary!");
        }

        const product = await Product.findById(id);
        if (!product) {
            throw new Error("Product not found! - backend")
        }

        if (productDetails.productName) {
            product.productName = productDetails.productName;
        }

        if (productDetails.productPrice) {
            product.productPrice = productDetails.productPrice;
        }

        if (productDetails.productQuantity) {
            product.productQuantity = productDetails.productQuantity;
        }

        // the productUpdatedOn field must be updated everytime there is an update on the product details
        product.productUpdatedOn = new Date().toLocaleString();
        await product.save(); // saving the updated product

        return {
            message: "Product updated successfully! - backend",
            product
        }

    }
}

export const addProduct = async (req, res) => {
    const { productDetails } = req.body;
    const adminControl = new AdminControl();
    try {
        const response = await adminControl.addProduct(productDetails);
        return res.status(201).json(response)
    } catch (error) {
        res.status(error.errorCode || 500).json({
            error: error.message || "Internal server error! - backend"
        })
    }
}

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { productDetails } = req.body;

    const adminControl = new AdminControl();
    try {
        const response = await adminControl.updateProduct(id, productDetails);
        return res.status(200).json(response);
    } catch (error) {
        res.status(error.errorCode || 500).json({
            error: error.message || "Internal server error! - backend"
        })
    }
}
