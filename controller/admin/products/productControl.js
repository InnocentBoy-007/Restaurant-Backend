import mongoose from 'mongoose';
import ProductModel from '../../../model/productModel.js'
import AdminModel from '../../../model/usermodel/adminModel.js'

class ProductController {
    async addProduct(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid adminId! - backend" });
        const { productDetails } = req.body;
        if (!productDetails || typeof productDetails !== 'object') return res.status(400).json({ message: "Invalid body(product details)! - backend" });
        try {
            const isValidAdmin = await AdminModel.findById(adminId).select("username");
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid adminId! Authorization revoked! - backend" });
            const isProductDuplicate = await ProductModel.findOne({ productName: productDetails.productName });
            if (isProductDuplicate) return res.status(409).json({ message: "Product is already in the store" });

            const newProduct = await ProductModel.create({
                ...productDetails, productAddedBy: isValidAdmin.username, productAddedOn: new Date().toLocaleString()
            });
            if (!newProduct) return res.status(500).json({ message: "Product cannot be added! - backend" });

            return res.status(201).json({ message: `${newProduct.productName} is added successfully on ${newProduct.productAddedOn}! - backend` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to add the product! - backend" });
        }
    }

    async updateProduct(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });
        const { productId } = req.params;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid product Id! - backend" });
        const { newDetails } = req.body;
        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(404).json({ message: "Invalid admin Id! Authorization revoked! - backend" });

            const isValidProduct = await ProductModel.findById(productId);
            if (!isValidProduct) return res.status(404).json({ message: "Invalid product Id! Product not found! - backend" });

            const updatedProduct = isValidProduct.updateOne({ ...newDetails });
            await updatedProduct.save();

            if (!updatedProduct) return res.status(500).json({ message: `${isValidProduct.productName} cannot be updated! - backend` });

            return res.status(200).json({ message: `${isValidProduct.productName} updated successfully! - backend` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to update the product! - backend" });
        }
    }

    async deleteProduct(req, res) {
        const adminId = req.adminId;
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) return res.status(400).json({ message: "Invalid admin Id! - backend" });

        const { productId } = req.params;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: "Invalid product Id! - backend" });

        try {
            const isValidAdmin = await AdminModel.findById(adminId);
            if (!isValidAdmin) return res.status(404).json(({ message: "Invalid admin Id! Authorization revoked! - backend" }));

            const isValidProduct = await ProductModel.findByIdAndDelete(productId);
            if (!isValidProduct) return res.status(500).json({ message: "Product cannot be deleted! - backend" });

            const timestamp = new Date().toLocaleString();

            return res.status(200).json({ message: `Product deleted successfully on ${timestamp} - backend` });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An unexpected error occured while trying to delete the product! - backend" });
        }
    }
}

const productController = new ProductController();

export default {
    addProduct: productController.addProduct,
    updateProduct: productController.updateProduct,
    deleteProduct: productController.deleteProduct
}
