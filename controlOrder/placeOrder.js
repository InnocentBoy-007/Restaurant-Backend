import OrderService from "./OrderServerice.js";
import { CustomError } from "./OrderServerice.js";

// Controller function of OrderService class (standalone functions)
export const placeOrder = async (req, res) => {
    const { id } = req.params;
    const { orderDetails } = req.body;
    const orderService = new OrderService();

    try {
        const response = await orderService.placeOrder(id, orderDetails);
        return res.status(200).json(response)

    } catch (error) {
        // Handle the error based on its type or properties
        if (error instanceof CustomError) {
            return res.status(error.errorCode).json({ message: error.message });
        }
        // For unexpected errors, return a generic message
        return res.status(500).json({ message: "Internal server error! - backend" });
    }
}
