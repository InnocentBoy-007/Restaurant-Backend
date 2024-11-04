import { AdminControl, CustomError } from "./adminProductControl.js";

export const addProduct = async (req, res) => {
    const { productDetails } = req.body;
    const adminControl = new AdminControl();
    try {
        const response = await adminControl.addProduct(productDetails);
        return res.status(201).json(response)
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message })
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}
