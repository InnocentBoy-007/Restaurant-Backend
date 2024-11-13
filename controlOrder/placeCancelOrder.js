import { OrderService } from "../services/clientService.js";
import { CustomError } from "../components/CustomError.js";

const orderService = new OrderService();

// Controller functions of OrderService class (standalone functions)

// (test passed)
export const trackOrderDetails = async (req, res) => {
    const { phoneNo } = req.body;
    try {
        const response = await orderService.trackOrderDetails(phoneNo);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const addToCart = async (req, res) => {
    const { productId } = req.params;
    try {
        const response = await orderService.addToCart(productId);
        return res.status(201).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

export const fetchProductsFromCart = async(req, res) => {
    const {productId} = req.params;
    try {
        const response = await orderService.fetchProductsFromCart(productId);
        return res.status(200).json(response);
    } catch (error) {
        if(error instanceof CustomError) return res.status(error.errorCode).json({message:error.message});
    }
}

// (test passed)
export const placeOrder = async (req, res) => {
    const { productId } = req.params;
    const { clientDetails } = req.body;

    try {
        const response = await orderService.placeOrder(productId, clientDetails);
        return res.status(200).json(response)

    } catch (error) {
        // Handle the error based on its type or properties
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}

// (test passed)
export const clientVerification = async (req, res) => {
    const { otp } = req.body;
    try {
        const response = await orderService.clientVerification(otp);
        return res.status(200).json(response);
    } catch (error) {
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
    const { orderId } = req.params;
    try {
        const response = await orderService.orderConfirmation(orderId);
        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof CustomError) return res.status(error.errorCode).json({ message: error.message });
    }
}
