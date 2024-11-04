import { AdminControl, CustomError } from "./adminProductControl.js";

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { productDetails } = req.body;

    const adminControl = new AdminControl();
    try {
        const response = await adminControl.updateProduct(id, productDetails);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.errorCode).json({ message: error.message })
        }
        res.status(500).json({ message: "Internal server error! - backend" })
    }
}
