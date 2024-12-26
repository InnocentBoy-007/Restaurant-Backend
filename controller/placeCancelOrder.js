import { OrderService } from "../services/clientService.js";
import { CustomError } from "../components/CustomError.js";

const orderService = new OrderService();


// (test passed)
export const trackOrderDetails = async (req, res) => {
    const { email } = req.params;
    try {
        const response = await orderService.trackOrderDetails(email);
        return res.status(203).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// test passed
export const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const clientId = req.clientId;
    try {
        const response = await orderService.removeProductFromCart(productId, clientId);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const fetchProductsFromCart = async (req, res) => {
    const clientId = req.clientId;
    try {
        const response = await orderService.fetchProductsFromCart(clientId);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
