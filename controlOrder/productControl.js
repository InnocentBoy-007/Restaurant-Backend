import mongoose from 'mongoose';
import Product from '../model/productModel.js'
import { CustomError } from '../components/CustomError.js';
import AdminModel from '../model/usermodel/adminModel.js'

export class ProductControl {
    async addProduct(productDetails) {
        if (!productDetails || typeof productDetails !== 'object') throw new CustomError("Product details are necessary!", 400);
        try {
            // track the time of product addition
            const productAddedOn = new Date().toLocaleString();

            const productAddedByAdmin = await AdminModel.findOne({ name: productDetails.productAddedBy }); // check if the admin adding the product exists
            if (!productAddedByAdmin) throw new CustomError(`Product cannot be added since ${productDetails.productAddedBy} is not an admin. - backend`, 401);

            const duplicateProduct = await Product.findOne({ productName: productDetails.productName });
            if (duplicateProduct) throw new CustomError(`${productDetails.productName} is already inside the database.`, 409); // http status code 409 for 'duplicate'

            const addProductResponse = await Product.create({ ...productDetails, productAddedOn: productAddedOn })

            return {
                message: "Product added successfully! - backend",
                addProductResponse
            }
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An internal server error while adding a product! - backend", 500);
        }
    }

    async updateProduct(id, productDetails) {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid ID - backend", 409);
        if (!productDetails || typeof productDetails !== 'object') throw new CustomError("Product details are necessary!", 400);
        try {
            const product = await Product.findById(id);
            if (!product) throw new CustomError("Product not found! - backend", 404);

            if (productDetails.productName) product.productName = productDetails.productName;

            if (productDetails.productPrice) product.productPrice = productDetails.productPrice;

            if (productDetails.productQuantity) {
                // add product quantity on top of the existing quantity
                product.productQuantity += productDetails.productQuantity;
            }

            // the productUpdatedOn field must be updated everytime there is an update on the product details
            product.productUpdatedOn = new Date().toLocaleString();
            await product.save(); // saving the updated product

            return {
                message: "Product updated successfully! - backend",
                product
            }
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while updating a product! - backend", 500);
        }
    }

    async deleteProduct(id) {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) throw new CustomError("Invalid Id - backend!", 409);
        try {
            const product = await Product.findByIdAndDelete(id); // find the product by using req params product id and delete if it exist
            if (!product) throw new CustomError("Product cannot be deleted! - backend", 500);

            return { message: "Product deleted successfully! - backend", product };
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while deleting a product! - backend", 500);
        }
    }
}

export const fetchProducts = async (req, res) => {
    try {
        const products = await Product.find();
        if (!products) throw new CustomError("Products cannot be fetch from database! - backend", 500);
        if (products.length === 0) return res.status(404).json({ message: "There are no products in the database! - backend" });
        return res.status(200).json({ products });
    } catch (error) {
        console.log("Error while fetching products in product control --->", error);

        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
        return res.status(500).json({ message: "An unexpected error occured while trying to fetch products from the database! - backend" });
    }
}
