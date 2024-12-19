import { ProductControl } from "../controller/productControl.js";
import { CustomError } from "../components/CustomError.js";

const productControl = new ProductControl();

export const addProduct = async (req, res) => {
    const adminId = req.adminId;
    const { productDetails } = req.body;
    try {
        const response = await productControl.addProduct(adminId, productDetails);
        return res.status(201).json(response); // it returns only a message
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
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
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    const adminId = req.adminId;
    const { productId } = req.params;
    try {
        const response = await productControl.deleteProduct(adminId, productId);
        res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
