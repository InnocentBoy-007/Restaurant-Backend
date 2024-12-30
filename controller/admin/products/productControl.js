// Custom error needs to be changed (Custom error file deleted)


import mongoose from 'mongoose';
import ProductModel from '../../../model/productModel.js'
import { CustomError } from '../../../components/CustomError.js';
import AdminModel from '../../../model/usermodel/adminModel.js'

export class ProductControl {
    async addProduct(adminId, productDetails) {
        if (!productDetails || typeof productDetails !== 'object') throw new CustomError("Product details are necessary!", 400);
        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("name");
            if (!isValidAdmin) throw new CustomError(`Product cannot be added since ${isValidAdmin.name} is not an admin. - backend`, 401);

            const duplicateProduct = await ProductModel.findOne({ productName: productDetails.productName });
            if (duplicateProduct) throw new CustomError(`${productDetails.productName} is already inside the database.`, 409); // http status code 409 for 'duplicate'

            const addedProduct = await ProductModel.create({ ...productDetails, productAddedBy: isValidAdmin.name, productAddedOn: new Date().toLocaleString() });

            return { message: `Product added successfully! Product added on ${addedProduct.productAddedOn} - backend`, }

        } catch (error) {
            if (error instanceof CustomError) throw error;
            throw new CustomError("An internal server error while adding a product! - backend", 500);
        }
    }

    async updateProduct(adminId, productId, productDetails) {
        if (!adminId) throw new CustomError("Invalid adminId - backend", 400);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid productId - backend", 400);
        if (!productDetails || typeof productDetails !== 'object') throw new CustomError("Product details are necessary!", 400);
        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("name");
            if (!isValidAdmin) throw new CustomError("Invalid admin! Authorization revoked! - backend", 403);

            const isValidProduct = await ProductModel.findByIdAndUpdate(productId, {
                ...productDetails
            });
            if (!isValidProduct) throw new CustomError("Product not found! - backend", 404);

            // the productUpdatedOn field must be updated everytime there is an update on the product details
            isValidProduct.productUpdatedOn = new Date().toLocaleString();
            isValidProduct.productUpdatedBy = isValidAdmin.name;
            await isValidProduct.save(); // saving the updated product

            return { message: `Product updated successfully on ${isValidProduct.productAddedOn} by ${isValidAdmin.name} - backend`, }
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while updating a product! - backend", 500);
        }
    }

    async deleteProduct(adminId, productId) {
        if (!adminId) throw new CustomError("Invalid adminId - backend", 400);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) throw new CustomError("Invalid productId - backend!", 409);
        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("name");
            if (!isValidAdmin) throw new CustomError(`Invalid admin! Authorization revoked! - backend`, 403);

            const isValidProduct = await ProductModel.findByIdAndDelete(productId);
            if (!isValidProduct) throw new CustomError("Product cannot be deleted! - backend", 500);

            const timestamp = new Date().toLocaleString();

            return { message: `Product deleted successfully by ${isValidAdmin.name} on ${timestamp} - backend` };
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) throw error;
            throw new CustomError("An unexpected error occured while deleting a product! - backend", 500);
        }
    }
}
