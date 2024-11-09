import { ProductControl } from "../controlOrder/productControl.js";
import { CustomError } from "../components/CustomError.js";

const productControl = new ProductControl();

export const fetchProduct = async(req, res) => {
    try {
        const response = await productControl.fetchProduct();
        return res.status(200).json(response);
    } catch (error) {
        if(error instanceof CustomError) return res.status(error.errorCode).json({message:error.message});
    }
}

export const addProduct = async (req, res) => {
    const { productDetails } = req.body;
    try {
        const response = await productControl.addProduct(productDetails);
        return res.status(201).json(response)
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { productDetails } = req.body;
    try {
        const response = await productControl.updateProduct(id, productDetails);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await productControl.deleteProduct(id);
        res.status(204).json({ message: "Product deleted successfully! - backend" });
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
