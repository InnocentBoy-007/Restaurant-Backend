// Bring this to the controller section


import { ProductControl } from "../controller/admin/products/productControl.js";

const productControl = new ProductControl();

export const addProduct = async (req, res) => {
    const adminId = req.adminId;
    const { productDetails } = req.body;
    try {
        const response = await productControl.addProduct(adminId, productDetails);
        return res.status(201).json(response); // it returns only a message
    } catch (error) {
        return res.status(500).json({ message: "An unexpected error occured while trying to add product! - backend" });
    }
}

export const updateProduct = async (req, res) => {
    const adminId = req.adminId;
    const { productId } = req.params;
    const { productDetails } = req.body;
    try {
        const response = await productControl.updateProduct(adminId, productId, productDetails);
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "An unexpected error occured while trying to update the product" });
    }
}

export const deleteProduct = async (req, res) => {
    const adminId = req.adminId;
    const { productId } = req.params;
    try {
        const response = await productControl.deleteProduct(adminId, productId);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "An unexpected error occured while trying to delete the product! - backend" });
    }
}
