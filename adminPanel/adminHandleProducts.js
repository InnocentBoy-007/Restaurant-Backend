import { ProductControl } from "../controlOrder/productControl.js";
import { CustomError } from "../components/CustomError.js";

const productControl = new ProductControl();

export const addProduct = async (req, res) => {
    const { productDetails } = req.body;
    try {
        const response = await productControl.addProduct(productDetails);
        return res.status(201).json(response)
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message })
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}


export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { productDetails } = req.body;
    try {
        const response = await productControl.updateProduct(id, productDetails);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message })
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}
