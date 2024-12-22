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

// (test passed)
export const addToCart = async (req, res) => {
    const clientId = req.clientId;
    const { productId } = req.params;
    try {
        const response = await orderService.addToCart(clientId, productId);
        return res.status(201).json(response);
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

// (test passed)
export const placeOrder = async (req, res) => {
    const clientId = req.clientId;
    const { orderDetails } = req.body;

    try {
        const response = await orderService.placeOrder(clientId, orderDetails);
        return res.status(200).json(response)

    } catch (error) {
        // Handle the error based on its type or properties
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (not tested)
export const cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const response = await orderService.cancelOrder(orderId);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const orderConfirmation = async (req, res) => {
    const { orderId, email } = req.params;
    try {
        const response = await orderService.orderConfirmation(orderId, email);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
