import mongoose from 'mongoose';
import Product from '../model/productModel.js'
import { CustomError } from '../components/CustomError.js';
import AdminModel from '../model/adminModel.js'

export class ProductControl {
    async fetchProduct() {
        try {
            const product = await Product.find();
            if (product.length === 0) throw new CustomError("There are no products in the database! - backend", 404);
            return product;
        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while fetching products details from the database - backend", 500);
        }
    }

    async addProduct(productDetails) {
        if (!productDetails || typeof productDetails !== 'object') throw new CustomError("Product details are necessary!", 400);
        try {
            // track the time of product addition
            const productAddedOn = new Date().toLocaleString();

            const productAddedByAdmin = await AdminModel.findOne({ adminName: productDetails.productAddedBy }); // check if the admin adding the product exists
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
